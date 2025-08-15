import mongoose, { ClientSession, Types } from 'mongoose';
import { TProfile, TUser } from './user.interface';
import { Profile, User } from './user.model';
import { uploadImgToCloudinary } from '../../util/uploadImgToCloudinary';

const createUser = async (payload: Partial<TUser>, method?: string) => {
  if (!payload) {
    throw new Error('User info not found!!');
  }

  const existingUser = await User.findOne({ email: payload.email }).select(
    '+password',
  );

  // console.log('existing user: ', existingUser);

  if (existingUser) {
    throw new Error('This user already exist!');
  }

  // const session: ClientSession = await mongoose.startSession();
  try {
    const newUser = await User.create(payload);

    const safeUser = await User.findById(newUser._id).select(
      '-password -secretKey',
    );

    return safeUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  } finally {
    // session.endSession();
  }
};


const getAllUsers = async () => {
  const result = await User.find();
  return result;
};

const updateProfileData = async (
  user_id: Types.ObjectId,
  payload: Partial<TProfile>,
) => {
  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { user_id },
      { $set: payload },
      { new: true },
    );
    return updatedProfile;
  } catch (error) {
    throw error;
  }
};

const deleteSingleUser = async (user_id: Types.ObjectId) => {
  const session: ClientSession = await mongoose.startSession();
  session.startTransaction();
  try {
    await User.findOneAndUpdate(
      { _id: user_id },
      { isDeleted: true, email: null },
      { session },
    );
    await Profile.findOneAndUpdate(
      { user_id },
      { isDeleted: true, email: null },
      { session },
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const selfDistuct = async (user_id: Types.ObjectId) => {
  const result = deleteSingleUser(user_id);
  return result;
};

const uploadOrChangeImg = async (
  user_id: Types.ObjectId,
  imgFile: Express.Multer.File,
) => {
  if (!user_id || !imgFile) {
    throw new Error('User ID and image file are required.');
  }

  // Upload new image to Cloudinary
  const result = await uploadImgToCloudinary(imgFile.filename, imgFile.path);

  console.log(result);

  if (!result.secure_url) {
    throw new Error('Image upload failed.');
  }

  // Update user profile with new image URL
  const updatedUserProfile = await Profile.findOneAndUpdate(
    { user_id }, // Corrected query (find by user_id, not _id)
    { img: result.secure_url },
    { new: true },
  );

  if (!updatedUserProfile) {
    throw new Error('Profile not found or update failed.');
  }

  return updatedUserProfile;
};

const getProfile = async (user_id: Types.ObjectId) => {
  const profile = await Profile.findOne({ user_id });

  return profile;
};

const userServices = {
  createUser,
  getAllUsers,
  updateProfileData,
  deleteSingleUser,
  selfDistuct,
  uploadOrChangeImg,
  getProfile,
};

export default userServices;
