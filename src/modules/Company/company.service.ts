import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import ApppError from '../../error/AppError';
import { ICompany } from './company.interface';
import { Company } from './company.model';
import { companySarchableFields } from './conpany.constant';
import { LoadModel } from '../load/load.model';
import { notificationService } from '../notification/notification.service';
import { Types } from 'mongoose';
import { ENotificationType } from '../notification/notification.interface';
import { ILoad } from '../load/load.interface';

const getAllCompanyFromDb = async (query: Record<string, unknown>) => {
  const companyQuery = new QueryBuilder(Company.find(), query)
    .search(companySarchableFields)
    .sort()
    .filter()
    .paginate();
  // console.log({ companyQuery });
  const result = await companyQuery.modelQuery
    .select('-password')
    .populate('user')
    .populate('loads')
    .populate('drivers');
  // console.log({ result });
  const metadata = await companyQuery.getMetaData();
  return {
    meta: metadata,
    data: result,
  };
};

const getSingleCompany = async (id: string) => {
  const result = await Company.findById(id)
    .populate('user')
    .populate('loads')
    .populate('drivers')
    .select('-password');
  return result;
};

const updateCompany = async (companyId: string, payload: ICompany) => {
  const {
    address,
    notificationPreferences,
    loads,
    drivers,
    ...restCompanyInfo
  } = payload;
  const updatedCompany: Record<string, unknown> = { ...restCompanyInfo };
  if (address) {
    (Object.keys(address) as (keyof {})[]).forEach((key) => {
      updatedCompany[`address.${key}`] = address[key];
    });
  }
  if (notificationPreferences) {
    (Object.keys(notificationPreferences) as (keyof {})[]).forEach((key) => {
      updatedCompany[`notificationPreferences.${key}`] =
        notificationPreferences[key];
    });
  }

  const result = await Company.findByIdAndUpdate(
    companyId,
    {
      $set: {
        ...updatedCompany,
      },
      $push: {
        loads,
        drivers,
      },
    },
    { new: true, upsert: true },
  )
    .populate('user')
    .populate('loads')
    .populate('drivers')
    .select('-password');
  return result;
};

const getAllCompanyLoad = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const isCompanyExist = await Company.findOne({ user: userId })
    .populate('loads')
    .select('-password');
  console.log({ isCompanyExist });
  if (!isCompanyExist) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'Company not found');
  }

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
  const result = await loadQuery.modelQuery.populate({
    path: 'assignedDriver',
    populate: { path: 'user', select: 'name email profileImage role' },
  });

  const meta = await loadQuery.getMetaData();
  return {
    data: result,
    meta,
  };
};

const companyStat = async (id: string) => {
  const isCompanyExist = await Company.findOne({ user: id })
    .populate('user')
    .populate('loads');
  // console.log({ id, isCompanyExist: isCompanyExist?.loads });
  const allLoads = await LoadModel.find({ companyId: isCompanyExist?.id });
  const activeLoads = allLoads.filter(
    (el) => el.loadStatus !== 'Delivered',
  ).length;
  const unassignedLoads = allLoads.filter((el) => !el.assignedDriver).length;

  const totalAmount = allLoads.reduce((acc, el) => acc + el.totalPayment, 0);
  const totalDriver = isCompanyExist?.drivers.length;
  return {
    totalLoads: allLoads.length,
    activeLoads,
    unassignedLoads,

    totalAmount,
    totalDriver,
  };
};

const sendNotificationToSuggestedDrivers = async (
  companyId: string,
  payload: { driverUserIds: string[]; loadId: string },
) => {
  const isCompanyExist = await Company.findOne({ user: companyId });
  if (!isCompanyExist) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'Company not found');
  }
  const isLoadExist = await LoadModel.findById(payload.loadId);
  if (!isLoadExist) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'Load not found');
  }
  console.log(payload.driverUserIds);
  for (const driverId of payload.driverUserIds) {
    await notificationService.sendNotification({
      senderId: companyId as unknown as Types.ObjectId, // Company that sends the load
      receiverId: driverId as unknown as Types.ObjectId, // Driver receiving notification
      type: ENotificationType.LOAD_ASSIGNMENT, // Custom type
      content: 'New load available. Do you want to accept it?',
      load: isLoadExist as ILoad, // Store load reference for driver action
    });
  }
};

export const companyService = {
  getAllCompanyFromDb,
  getSingleCompany,
  updateCompany,
  getAllCompanyLoad,
  companyStat,
  sendNotificationToSuggestedDrivers,
};
