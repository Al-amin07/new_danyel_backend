import config from '../../config';
import fs, { stat } from 'fs';
import path from 'path';
import { Driver } from './driver.model';
import { LoadModel } from '../load/load.model';
import mongoose from 'mongoose';
import ApppError from '../../error/AppError';
import { StatusCodes } from 'http-status-codes';
import { IReview } from './driver.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import { IStatusTimeline } from '../load/load.interface';
import { getLoadNote } from '../load/load.constant';
const getAllDriver = async (query: Record<string, unknown>) => {
  const driverQuery = new QueryBuilder(
    Driver.find().populate({
      path: 'user',
      select: 'name email profileImage role',
    }),
    query,
  )
    .search([
      'user.name',
      'user.email',
      'location.city',
      'location.street',
      'location.zipCode',
      'vehicleType',
      'vehicleModel',
      'availability',
    ])
    .filter()
    .sort()
    .paginate();
  const result = await driverQuery.modelQuery;
  const meta = await driverQuery.getMetaData();
  return {
    data: result,
    meta,
  };
};
const updateDriverProfileIntoDb = async (
  id: string,
  payload: any,

  files: { [fieldname: string]: Express.Multer.File[] } | undefined,
) => {
  const folder = 'uploads/drivers'; // local folder for drivers
  const { location, loads, ...restDriverData } = payload;
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  const updateData: any = { ...restDriverData };

  const fileFields: Record<string, string> = {
    nidOrPassport: 'nidOrPassport',
    drivingLicense: 'drivingLicense',
    vehicleRegistration: 'vehicleRegistration',
  };
  for (const [key, field] of Object.entries(fileFields)) {
    if (files?.[key]?.[0]) {
      const file = files[key][0];

      // Move file to /uploads/drivers with unique name
      const fileName = `${Date.now()}-${file.originalname}`;
      const destPath = path.join(folder, fileName);

      fs.renameSync(file.path, destPath);
      console.log(`File saved to ${destPath}`);
      // Save relative URL for DB
      updateData[field] = {
        type: file.mimetype,
        url: `${config.server_url}/uploads/drivers/${fileName}`,
      };
    }
  }

  if (location) {
    (Object.keys(location) as (keyof {})[]).forEach((key) => {
      updateData[`location.${key}`] = location[key];
    });
  }
  const result = await Driver.findOneAndUpdate({ user: id }, updateData, {
    new: true,
  });
  return result;
};

const assignLoadToDriver = async (id: string, loadId: string) => {
  if (!mongoose.Types.ObjectId.isValid(loadId)) {
    throw new ApppError(StatusCodes.BAD_REQUEST, 'Invalid load ID');
  }

  const isLoadExist = await LoadModel.findById(loadId).lean();
  if (!isLoadExist) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'Load not found');
  }
  if (isLoadExist?.assignedDriver) {
    throw new ApppError(
      StatusCodes.BAD_REQUEST,
      'This load is already assigned to another driver',
    );
  }
  const isDriverExist = await Driver.findOne({ user: id }).populate('user');
  if (!isDriverExist) {
    throw new ApppError(
      StatusCodes.NOT_FOUND,
      'Driver profile not found. Please complete your driver profile first.',
    );
  }
  const statusTimeline = {
    status: 'Assigned',
    timestamp: new Date(),
    notes: `Load assigned to ${(isDriverExist?.user as any)?.name}`,
  };
  console.log({ isDriverExist });
  if (
    isDriverExist.loads &&
    isDriverExist.loads.length > 0 &&
    isDriverExist.loads.includes(new mongoose.Types.ObjectId(loadId))
  ) {
    throw new ApppError(
      StatusCodes.BAD_REQUEST,
      'This load is already assigned to you',
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await Driver.findOneAndUpdate(
      { user: id },
      {
        $push: { loads: loadId },
      },
      { new: true, session, upsert: true },
    );

    await LoadModel.findByIdAndUpdate(
      loadId,
      {
        assignedDriver: result.id,
        loadStatus: 'Awaiting Pickup',
        $push: { statusTimeline },
      },
      { session },
    );

    const populatedResult = await Driver.findById(result._id)
      .populate('loads')
      .session(session);

    await session.commitTransaction();
    session.endSession();

    return populatedResult;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const updateLoadStatus = async (
  id: string,
  payload: { loadId: string; status: string },
) => {
  if (!mongoose.Types.ObjectId.isValid(payload?.loadId)) {
    throw new ApppError(StatusCodes.BAD_REQUEST, 'Invalid load ID');
  }

  const isLoadExist = await LoadModel.findById(payload?.loadId).lean();
  if (!isLoadExist) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'Load not found');
  }
  if (isLoadExist.loadStatus === payload?.status) {
    throw new ApppError(
      StatusCodes.BAD_REQUEST,
      `Load is already in ${payload?.status} status`,
    );
  }

  const isDriverExist = await Driver.findOne({ user: id });
  if (!isDriverExist) {
    throw new ApppError(
      StatusCodes.NOT_FOUND,
      'Driver profile not found. Please complete your driver profile first.',
    );
  }
  console.log(isLoadExist?.assignedDriver === isDriverExist?.id);
  if (isLoadExist.assignedDriver != isDriverExist?.id) {
    throw new ApppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to update this load status',
    );
  }

  if (payload?.status) {
    const statusTimeline: IStatusTimeline = {
      status: payload?.status as
        | 'Pending Assignment'
        | 'Assigned'
        | 'In Transit'
        | 'At Pickup'
        | 'En Route to Pickup'
        | 'Delivered'
        | 'Cancelled',
      timestamp: new Date(),
      notes: getLoadNote(
        payload?.status as
          | 'Pending Assignment'
          | 'Assigned'
          | 'In Transit'
          | 'At Pickup'
          | 'En Route to Pickup'
          | 'Delivered'
          | 'Cancelled',
        (isLoadExist.assignedDriver as any).name,
      ),
    };
    if (payload?.status === 'In Transit') {
      statusTimeline.expectedDeliveryDate = new Date(
        new Date().getTime() + 12 * 60 * 60 * 1000,
      );
    }
    const result = await LoadModel.findByIdAndUpdate(
      payload?.loadId,
      { loadStatus: payload?.status, $push: { statusTimeline } },
      { new: true },
    );
    return result;
  }
};

const reviewDriver = async (id: string, payload: IReview) => {
  const isDriverExist = await Driver.findById(id);
  if (!isDriverExist) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'Driver not found');
  }

  const isReviewExist = isDriverExist?.reviews?.find(
    (el) => el.loadId == payload.loadId,
  );
  if (isReviewExist) {
    throw new ApppError(
      StatusCodes.BAD_REQUEST,
      'You already reviewed this driver for this load',
    );
  }

  const totalReviews = isDriverExist?.reviews?.reduce(
    (acc, el) => acc + el.rating,
    0,
  );
  const averageRating =
    ((totalReviews as number) + payload.rating) /
    ((isDriverExist?.reviews?.length as number) + 1);

  console.log({ payload, isDriverExist, averageRating });
  const result = await Driver.findByIdAndUpdate(
    id,
    { $push: { reviews: payload }, $set: { averageRating } },
    { new: true },
  );
  return result;
};

const updateDriverStatus = async (id: string, payload: { status: boolean }) => {
  const isDriverExist = await Driver.findOne({ user: id });
  if (!isDriverExist) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'Driver not found');
  }
  const result = await Driver.findByIdAndUpdate(
    isDriverExist?.id,
    { status: payload.status },
    { new: true },
  );
  return result;
};

export const driverService = {
  updateDriverProfileIntoDb,
  assignLoadToDriver,
  updateLoadStatus,
  reviewDriver,
  getAllDriver,
  updateDriverStatus,
};
