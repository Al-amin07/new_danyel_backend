import config from '../../config';
import fs, { stat } from 'fs';
import path from 'path';
import { Driver } from './driver.model';
import { LoadModel } from '../load/load.model';
import mongoose from 'mongoose';
import ApppError from '../../error/AppError';
import { StatusCodes } from 'http-status-codes';
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
  const isDriverExist = await Driver.findOne({ user: id });
  if (!isDriverExist) {
    throw new ApppError(
      StatusCodes.NOT_FOUND,
      'Driver profile not found. Please complete your driver profile first.',
    );
  }
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
      { assignedDriver: result.id, loadStatus: 'Awaiting Pickup' },
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
  // return {
  //   isLoadExist: isLoadExist?.assignedDriver,
  //   isDriverExistId: isDriverExist?.id,
  // };

  if (isLoadExist.assignedDriver != isDriverExist?.id) {
    throw new ApppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to update this load status',
    );
  }

  const load = await LoadModel.findByIdAndUpdate(
    payload?.loadId,
    { loadStatus: payload?.status },
    { new: true },
  );
  return load;
};

export const driverService = {
  updateDriverProfileIntoDb,
  assignLoadToDriver,
  updateLoadStatus,
};
