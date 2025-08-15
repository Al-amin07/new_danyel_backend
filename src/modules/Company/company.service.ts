import { User } from '../user/user.model';

const getAllCompanyFromDb = async () => {
  const result = await User.find({role: 'company'}).select('-password');

  return result;
};


export const companyService = {
  getAllCompanyFromDb,
};
