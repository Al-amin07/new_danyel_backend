import mongoose, { ClientSession, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { TUser } from './user.interface';
import { User } from './user.model';
// import { uploadImgToCloudinary } from '../../util/uploadImgToCloudinary';
import { ICompany, TCompanyUser } from '../Company/company.interface';
import ApppError from '../../error/AppError';
import { StatusCodes } from 'http-status-codes';
import { Company } from '../Company/company.model';

const createCompanyToDB = async (payload: TCompanyUser) => {
  if (!payload) {
    throw new Error('User info not found!!');
  }

  const isUserExist = await User.findOne({ email: payload.email }).select(
    '+password',
  );

  if (isUserExist) {
    throw new ApppError(StatusCodes.CONFLICT, 'This user already exist!');
  }

  const { name, email, phone, password, role, ...extra } = payload;

  if (!password) {
    throw new Error('Password is required');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userInfo = {
    name,
    email,
    phone,
    password: hashedPassword,
    role,
  };
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await User.create([userInfo], { session });

    const companyInfo = {
      user: result[0]?._id,
      name,
      email,
      password: result[0]?.password,
      phone,
      companyName: extra?.companyName || '',
      companyAddress: extra?.companyAddress || '',
      numberOfEmployees: extra?.numberOfEmployees || 0,
      startOperationHour: extra?.startOperationHour || '',
      endOperationHour: extra?.endOperationHour || '',
      paymentTerms: extra?.paymentTerms,
      address: extra?.address,
      notificationPreferences: extra?.notificationPreferences,
      languagePreference: extra?.languagePreference,
      timeZone: extra?.timeZone,
      currency: extra?.currency,
      dateFormat: extra?.dateFormat,
    };

    await Company.create([companyInfo], { session });

    await session.commitTransaction();
    session.endSession();
    return result[0];
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getAllUsers = async () => {
  const result = await User.find();
  return result;
};

// const updateProfileData = async (
//   user_id: Types.ObjectId,
//   payload: Partial<TProfile>,
// ) => {
//   try {
//     const updatedProfile = await Profile.findOneAndUpdate(
//       { user_id },
//       { $set: payload },
//       { new: true },
//     );
//     return updatedProfile;
//   } catch (error) {
//     throw error;
//   }
// };

// Delete user

// const deleteSingleUser = async (user_id: Types.ObjectId) => {
//   const session: ClientSession = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     await User.findOneAndUpdate(
//       { _id: user_id },
//       { isDeleted: true, email: null },
//       { session },
//     );
//     await Profile.findOneAndUpdate(
//       { user_id },
//       { isDeleted: true, email: null },
//       { session },
//     );

//     await session.commitTransaction();
//     session.endSession();
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };

// const selfDistuct = async (user_id: Types.ObjectId) => {
//   const result = deleteSingleUser(user_id);
//   return result;
// };

// const uploadOrChangeImg = async (
//   user_id: Types.ObjectId,
//   imgFile: Express.Multer.File,
// ) => {
//   if (!user_id || !imgFile) {
//     throw new Error('User ID and image file are required.');
//   }

//   // Upload new image to Cloudinary
//   const result = await uploadImgToCloudinary(imgFile.filename, imgFile.path);

//   console.log(result);

//   if (!result.secure_url) {
//     throw new Error('Image upload failed.');
//   }

//   // Update user profile with new image URL
//   const updatedUserProfile = await Profile.findOneAndUpdate(
//     { user_id }, // Corrected query (find by user_id, not _id)
//     { img: result.secure_url },
//     { new: true },
//   );

//   if (!updatedUserProfile) {
//     throw new Error('Profile not found or update failed.');
//   }

//   return updatedUserProfile;
// };

// const getProfile = async (user_id: Types.ObjectId) => {
//   const profile = await Profile.findOne({ user_id });

//   return profile;
// };

const userServices = {
  createCompanyToDB,
  getAllUsers,
  // updateProfileData,
  // deleteSingleUser,
  // selfDistuct,
  // uploadOrChangeImg,
  // getProfile,
};

export default userServices;
