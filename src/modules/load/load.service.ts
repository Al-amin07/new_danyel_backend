import mongoose from 'mongoose';
import config from '../../config';
import ApppError from '../../error/AppError';
import { IAddress, ILoad } from './load.interface';
import { LoadModel } from './load.model';
import { Driver } from '../Driver/driver.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createLoadToDB = async (payload: ILoad, files: Express.Multer.File[]) => {
  if (!files || files.length === 0) {
    throw new ApppError(404, 'No files uploaded');
  }

  const documents = files.map((file) => ({
    type: file?.mimetype,
    url: `${config.server_url}/uploads/${file?.filename}`,
  }));
  console.log({ documents, payload });

  if (!payload?.totalPayment) {
    payload.totalPayment = payload.totalDistance * payload.ratePerMile;
  }

  const result = await LoadModel.create({ ...payload, documents });
  return result;
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
  const result = await loadQuery.modelQuery.populate('assignedDriver');
  const meta = await loadQuery.getMetaData();
  return {
    result,
    meta,
  };
};

const getSingleLoad = async (id: string) => {
  const result = await LoadModel.findById(id).populate('assignedDriver');
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
  const { pickupAddress, deliveryAddress, ...loadData } = payload;
  const isLoadExist = (await LoadModel.findById(id)) as ILoad;
  if (!isLoadExist) {
    throw new ApppError(404, 'Load not found');
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
  const isDriverExist = await Driver.findById(payload?.driverId).lean();
  if (!isDriverExist) {
    throw new ApppError(404, 'Driver not found');
  }
  if (
    isDriverExist?.loads &&
    isDriverExist.loads.length > 0 &&
    isDriverExist.loads.includes(new mongoose.Types.ObjectId(loadId))
  ) {
    throw new ApppError(400, 'This load is already assigned to this driver');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await LoadModel.findByIdAndUpdate(
      loadId,
      {
        assignedDriver: payload?.driverId,
        loadStatus: 'Awaiting Pickup',
      },
      { new: true, session },
    );
    await Driver.findByIdAndUpdate(
      payload?.driverId,
      {
        $push: { loads: loadId },
      },
      { session },
    );
    await session.commitTransaction();
    session.endSession();
    return result;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const updateLoadStatus = async (
  loadId: string,
  payload: { status: string },
) => {
  if (!mongoose.Types.ObjectId.isValid(loadId)) {
    throw new ApppError(400, 'Invalid load ID');
  }
  const isLoadExist = await LoadModel.findById(loadId).lean();
  if (!isLoadExist) {
    throw new ApppError(404, 'Load not found');
  }
  if (isLoadExist.loadStatus === payload?.status) {
    throw new ApppError(400, `Load is already in ${payload?.status} status`);
  }
  const result = await LoadModel.findByIdAndUpdate(
    loadId,
    { loadStatus: payload?.status },
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
