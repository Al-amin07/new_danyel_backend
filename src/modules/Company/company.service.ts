import QueryBuilder from '../../builder/QueryBuilder';
import { ICompany } from './company.interface';
import { Company } from './company.model';
import { companySarchableFields } from './conpany.constant';

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

export const companyService = {
  getAllCompanyFromDb,
  getSingleCompany,
  updateCompany,
};
