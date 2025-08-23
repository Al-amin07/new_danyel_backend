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
import authUtil from '../auth/auth.utill';
import config from '../../config';
import { generateOtp } from '../../util/generateOtp';

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

const sendVerifyEmailOtpAgain = async (email: string) => {
  const isUserExist = await User.findOne({ email }).select('+password');
  if (!isUserExist) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  if (isUserExist.isVerified) {
    throw new ApppError(
      StatusCodes.BAD_REQUEST,
      'This email is already verified',
    );
  }
  const otp = generateOtp();
  const result = await User.findOneAndUpdate(
    { email },
    {
      emailVerificationCode: otp,
      emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
    },
    { new: true },
  );
  if (!result) {
    throw new ApppError(StatusCodes.INTERNAL_SERVER_ERROR, 'Operation failed');
  }
  const sendEmailTo = await sendEmail(
    email,
    'Your verification code',
    generateOTPEmail(otp, result.name),
  );
  if (sendEmailTo.success === false) {
    throw new ApppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to send email',
    );
  }
  return 'Verification email sent successfully';
};

const getAllUsers = async () => {
  const result = await User.find();
  return result;
};

const verifyOtp = async (email: string, otp: string) => {
  const user = await User.findOne({ email }).lean();
  if (!user) {
    throw new ApppError(StatusCodes.NOT_FOUND, 'User not found');
  }
  if (user.isVerified) {
    throw new ApppError(
      StatusCodes.BAD_REQUEST,
      'This email is already verified',
    );
  }
  if (user.emailVerificationCode !== otp) {
    throw new ApppError(StatusCodes.UNAUTHORIZED, 'Invalid OTP');
  }
  if (
    user.emailVerificationExpires &&
    user.emailVerificationExpires < new Date()
  ) {
    throw new ApppError(StatusCodes.UNAUTHORIZED, 'OTP has expired');
  }
  user.isVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  user.lastLoggedin = new Date();
  const updatedUser = await User.findOneAndUpdate({ email }, user, {
    new: true,
  });

  const tokenizeData = {
    id: user._id,
    role: user.role,
    username: updatedUser?.name,
    email: updatedUser?.email,
  };

  const accessToken = authUtil.createToken(
    tokenizeData,
    config.jwt_token_secret,
    config.token_expairsIn,
  );

  const refreshToken = authUtil.createToken(
    tokenizeData,
    config.jwt_refresh_Token_secret,
    config.rifresh_expairsIn,
  );

  return { accessToken, refreshToken, userData: updatedUser };
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
  createDriverToDB,
  verifyOtp,
  sendVerifyEmailOtpAgain,
  // updateProfileData,
  // deleteSingleUser,
  // selfDistuct,
  // uploadOrChangeImg,
  // getProfile,
};

export default userServices;
