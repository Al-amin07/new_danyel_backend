import mongoose from 'mongoose';
import config from '../../config';
import ApppError from '../../error/AppError';
import { IAddress, ILoad, IStatusTimeline } from './load.interface';
import { LoadModel } from './load.model';
import { Driver } from '../Driver/driver.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { Company } from '../Company/company.model';
import { StatusCodes } from 'http-status-codes';
import { getLoadNote } from './load.constant';

const createLoadToDB = async (payload: ILoad, files: Express.Multer.File[]) => {
  if (!mongoose.Types.ObjectId.isValid(payload?.companyId)) {
    throw new ApppError(StatusCodes.BAD_REQUEST, 'Invalid Company ID');
  }
  const isLoadExist = await LoadModel.findOne({ loadId: payload?.loadId });
  if (isLoadExist) {
    throw new ApppError(StatusCodes.BAD_REQUEST, 'Duplicate Load Id');
  }
  const isCompanyExist = await Company.findById(payload?.companyId);
  if (!isCompanyExist) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'Company not found!!!');
  }

  if (!payload?.totalPayment) {
    payload.totalPayment = payload.totalDistance * payload.ratePerMile;
  }

  if (!files || files.length === 0) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'No files uploaded');
  }

  const documents = files.map((file) => ({
    type: file?.mimetype,
    url: `${config.server_url}/uploads/${file?.filename}`,
  }));

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await LoadModel.create([{ ...payload, documents }], {
      session,
    });
    if (payload?.assignedDriver) {
      if (!mongoose.Types.ObjectId.isValid(payload?.assignedDriver)) {
        throw new ApppError(StatusCodes.BAD_REQUEST, 'Invalid driver ID');
      }
      const isDriverExist = await Driver.findById(payload?.assignedDriver);
      if (!isDriverExist) {
        throw new ApppError(404, 'Driver not found');
      }
      await Driver.findByIdAndUpdate(
        payload?.assignedDriver,
        { $addToSet: { loads: result[0]._id } },
        { new: true, session },
      );
    }
    await Company.findByIdAndUpdate(
      payload?.companyId,
      { $addToSet: { loads: result[0]._id } },
      { new: true, session },
    );

    await session.commitTransaction();
    session.endSession();

    console.log({ resulttt: result[0] });
    return result[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllLoad = async (query: Record<string, unknown>) => {
  const loadQuery = new QueryBuilder(LoadModel.find(), query)
    .search([
      'loadId',
      'loadType',
      'loadStatus',
      'pickupAddress.street',
      'pickupAddress.city',
      'pickupAddress.apartment',
      'pickupAddress.country',
      'deliveryAddress.street',
      'deliveryAddress.city',
      'deliveryAddress.apartment',
      'deliveryAddress.country',
    ])
    .filter()
    .sort()
    .paginate();
  const result = await loadQuery.modelQuery
    .populate({
      path: 'assignedDriver',
      select: 'name email phone',
      populate: { path: 'user', select: 'name email profileImage role' },
    })
    .populate({
      path: 'companyId',
      populate: { path: 'user', select: 'name email profileImage role' },
    });
  const meta = await loadQuery.getMetaData();
  return {
    result,
    meta,
  };
};

const getSingleLoad = async (id: string) => {
  const result = await LoadModel.findById(id)
    .populate({
      path: 'assignedDriver',
      select: 'name email phone',
      populate: { path: 'user', select: 'name email profileImage role' },
    })
    .populate({
      path: 'companyId',
      populate: { path: 'user', select: 'name email profileImage role' },
    });
  if (!result) {
    throw new ApppError(404, 'Load not found');
  }
  return result;
};

const updateLoadToDB = async (
  id: string,
  payload: Partial<ILoad>,
  files: Express.Multer.File[],
) => {
  const { pickupAddress, deliveryAddress, customer, ...loadData } = payload;
  const isLoadExist = (await LoadModel.findById(id)) as ILoad;
  if (!isLoadExist) {
    throw new ApppError(404, 'Load not found');
  }
  const newDistance = payload.totalDistance ?? isLoadExist.totalDistance;
  const newRate = payload.ratePerMile ?? isLoadExist.ratePerMile;

  // If totalPayment not provided, calculate it
  if (!payload.totalPayment) {
    payload.totalPayment = newDistance * newRate;
  }
  const updatedLoad: Record<string, unknown> = { ...loadData };
  if (pickupAddress) {
    (Object.keys(pickupAddress) as (keyof IAddress)[]).forEach((key) => {
      updatedLoad[`pickupAddress.${key}`] = pickupAddress[key];
    });
  }
  if (deliveryAddress) {
    (Object.keys(deliveryAddress) as (keyof IAddress)[]).forEach((key) => {
      updatedLoad[`deliveryAddress.${key}`] = deliveryAddress[key];
    });
  }
  if (customer) {
    (Object.keys(customer) as (keyof {})[]).forEach((key) => {
      updatedLoad[`customer.${key}`] = customer[key];
    });
  }

  let documents: { type: string; url: string }[] = [];
  if (files.length > 0) {
    documents = files.map((file) => {
      return {
        type: file?.mimetype,
        url: `${config.server_url}/uploads/${file?.filename}`,
      };
    });
  }

  console.log({ documents });

  const result = await LoadModel.findByIdAndUpdate(
    id,
    {
      $set: {
        ...updatedLoad,
      },
      $push: { documents },
    },
    { new: true },
  );
  return result;
};

const assignDriver = async (loadId: string, payload: { driverId: string }) => {
  if (!mongoose.Types.ObjectId.isValid(loadId)) {
    throw new ApppError(400, 'Invalid load ID');
  }
  const isLoadExist = await LoadModel.findById(loadId).lean();
  if (!isLoadExist) {
    throw new ApppError(404, 'Load not found');
  }

  if (!mongoose.Types.ObjectId.isValid(payload?.driverId)) {
    throw new ApppError(400, 'Invalid driver ID');
  }
  const isDriverExist = await Driver.findById(payload?.driverId)
    .lean()
    .populate({ path: 'user', select: 'name email' });
  if (!isDriverExist) {
    throw new ApppError(404, 'Driver not found');
  }
  console.log({ isLoadExist, isDriverExist }, 'From Here');
  if (
    isDriverExist?.loads &&
    isDriverExist.loads.length > 0 &&
    isDriverExist.loads.some((id: mongoose.Types.ObjectId) => id.equals(loadId))
  ) {
    throw new ApppError(400, 'This load is already assigned to this driver');
  }

  const statusTimeline = {
    status: 'Assigned',
    timestamp: new Date(),
    notes: `Load assigned to ${(isDriverExist?.user as any)?.name}`,
  };
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await LoadModel.findByIdAndUpdate(
      loadId,
      {
        assignedDriver: payload?.driverId,
        loadStatus: 'Assigned',
        $push: { statusTimeline },
      },
      { new: true, session },
    );
    await Driver.findByIdAndUpdate(
      payload?.driverId,
      {
        $addToSet: { loads: loadId },
      },
      { session },
    ).populate('companyId');
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const updateLoadStatus = async (loadId: string, payload: Partial<ILoad>) => {
  if (!mongoose.Types.ObjectId.isValid(loadId)) {
    throw new ApppError(StatusCodes.BAD_REQUEST, 'Invalid load ID');
  }
  if (!payload?.loadStatus && !payload?.paymentStatus) {
    throw new ApppError(
      StatusCodes.BAD_REQUEST,
      'Enter Load Status or Payment Status',
    );
  }

  const isLoadExist = await LoadModel.findById(loadId)
    .lean()
    .populate({
      path: 'assignedDriver',
      populate: { path: 'user', select: 'name' },
    });
  if (!isLoadExist) {
    throw new ApppError(StatusCodes.BAD_REQUEST, 'Load not found');
  }
  if (isLoadExist.loadStatus === payload?.loadStatus) {
    throw new ApppError(
      400,
      `Load is already in ${payload?.loadStatus} status`,
    );
  }

  if (payload?.paymentStatus === 'PAID') {
    payload.paymentDate = new Date();
  }
  if (payload?.loadStatus) {
    const statusTimeline: IStatusTimeline = {
      status: payload?.loadStatus,
      timestamp: new Date(),
      notes: getLoadNote(
        payload?.loadStatus,
        (isLoadExist.assignedDriver as any).name,
      ),
    };
    if (payload?.loadStatus === 'In Transit') {
      statusTimeline.expectedDeliveryDate = new Date(
        new Date().getTime() + 12 * 60 * 60 * 1000,
      );
    }
    const result = await LoadModel.findByIdAndUpdate(
      loadId,
      { ...payload, $push: { statusTimeline } },
      { new: true },
    );
    return result;
  }

  const result = await LoadModel.findByIdAndUpdate(
    loadId,
    { ...payload },
    { new: true },
  );
  return result;
};

// Function to generate random load ID
async function generateLoadId(): Promise<string> {
  const numbers = Math.floor(100 + Math.random() * 900); // 3 random digits
  const letters = Array.from(
    { length: 2 },
    () => String.fromCharCode(65 + Math.floor(Math.random() * 26)), // 2 random uppercase letters
  ).join('');
  const moreNumbers = Math.floor(1000 + Math.random() * 9000); // 4 random digits

  return `#${numbers}${letters}${moreNumbers}`;
}

export const loadService = {
  createLoadToDB,
  getAllLoad,
  getSingleLoad,
  updateLoadToDB,
  assignDriver,
  generateLoadId,
  updateLoadStatus,
};
