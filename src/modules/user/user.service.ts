import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from './user.model';
// import { uploadImgToCloudinary } from '../../util/uploadImgToCloudinary';
import { TCompanyUser } from '../Company/company.interface';
import ApppError from '../../error/AppError';
import { StatusCodes } from 'http-status-codes';
import { Company } from '../Company/company.model';
import { TDriverUser } from '../Driver/driver.interface';
import { Driver } from '../Driver/driver.model';
import { sendEmail } from '../../util/sendEmail';
import generateOTPEmail from '../../util/generateOtpEmail';

import { generateOtp } from '../../util/generateOtp';
import { TUser } from './user.interface';

const createAdminToDB = async (payload: TUser) => {
  const isUserExist = await User.findOne({ email: payload.email });
  if (isUserExist) {
    throw new ApppError(StatusCodes.CONFLICT, 'This user already exist!');
  }
  const { name, email, phone, password } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOtp();
  const userInfo = {
    name,
    email,
    phone,
    password: hashedPassword,
    role: 'admin',
    emailVerificationCode: otp,
    emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
  };
  const result = await User.create(userInfo);
  const sendEmailTo = await sendEmail(
    email,
    'Your verification code',
    generateOTPEmail(otp, name),
  );
  console.log({ sendEmailTo });
  return result;
};

const createCompanyToDB = async (payload: TCompanyUser) => {
  if (!payload) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'User info not found!!');
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
  const otp = generateOtp();
  const userInfo = {
    name,
    email,
    phone,
    password: hashedPassword,
    role: 'company',
    emailVerificationCode: otp,
    emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
  };
  console.log({ userInfo });
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await User.create([userInfo], { session });
    console.log({ result });
    const companyInfo = {
      user: result[0]?._id,
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
    const sendEmailTo = await sendEmail(
      email,
      'Your verification code',
      generateOTPEmail(otp, name),
    );
    console.log({ sendEmailTo });
    return result[0];
  } catch (error) {
    // Rollback transaction
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const createDriverToDB = async (payload: TDriverUser) => {
  const { name, email, password, phone, ...driverData } = payload;
  console.log({ name, email, password, phone });
  const isUserExist = await User.findOne({ email }).select('+password');
  if (isUserExist) {
    throw new ApppError(StatusCodes.CONFLICT, 'This user already exist!');
  }
  if (!password) {
    throw new Error('Password is required');
  }
  const otp = generateOtp();
  const hashedPassword = await bcrypt.hash(password, 10);
  const userInfo = {
    name,
    email,
    phone,
    password: hashedPassword,
    role: 'driver',
    emailVerificationCode: otp,
    emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
  };
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await User.create([userInfo], { session });
    const { user, ...restDriverData } = driverData;
    const driverInfo = {
      user: result[0]?._id,
      ...restDriverData,
    };

    await Driver.create([driverInfo], { session });

    await session.commitTransaction();
    session.endSession();

    const sendEmailTo = await sendEmail(
      email,
      'Your verification code',
      generateOTPEmail(otp, name),
    );
    console.log({ sendEmailTo });
    return result[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
const getAllUsers = async () => {
  const result = await User.find();
  return result;
};

const getUserProfile = async (userId: string) => {
  const isUserExist = await User.findById(userId).select('-password');
  if (!isUserExist) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  if (isUserExist?.role === 'company') {
    const companyProfile = await Company.findOne({
      user: isUserExist.id,
    }).populate('user', '-password');
    return companyProfile;
  }
  if (isUserExist?.role === 'driver') {
    const driverProfile = await Driver.findOne({
      user: isUserExist.id,
    }).populate('user', '-password');
    return driverProfile;
  }
  return isUserExist;
};

const userServices = {
  createAdminToDB,
  createCompanyToDB,
  createDriverToDB,
  getAllUsers,
  getUserProfile,
  // updateProfileData,
  // deleteSingleUser,
  // selfDistuct,
  // uploadOrChangeImg,
  // getProfile,
};

export default userServices;

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
