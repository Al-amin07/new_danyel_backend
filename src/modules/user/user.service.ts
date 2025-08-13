import mongoose, { ClientSession, Types } from 'mongoose';
import { TProfile, TUser } from './user.interface';
import { ProfileModel, UserModel } from './user.model';
import { uploadImgToCloudinary } from '../../util/uploadImgToCloudinary';

const createUser = async (payload: Partial<TUser>, method?: string) => {
  if (!payload) {
    throw new Error('User info not found!!');
  }

  const existingUser = await UserModel.findOne({ email: payload.email }).select(
    '+password',
  );

  console.log('existing user: ', existingUser);

  if (existingUser) {
    throw new Error('This user already exist!');
  }

  const session: ClientSession = await mongoose.startSession();

  try {
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

// const createUser = async (payload: Partial<TUser>, method?: string) => {
//   if (!payload.aggriedToTerms) {
//     throw new Error("You must agree to the terms and conditions to register.");
//   }

//   const existingUser = await UserModel.findOne({ email: payload.email }).select('+password');

//   if (existingUser) {
//     if (!existingUser.isDeleted) {
//       return {
//         message: "A user with this email already exists and is active.",
//         data: null,
//       };
//     }
//   }

//   const session: ClientSession = await mongoose.startSession();

//   try {
//     const result = await session.withTransaction(async () => {
//       let user;

//       if (method) {
//         const { password, ...rest } = payload;
//         const created = await UserModel.create([rest], { session });
//         user = created[0];
//       } else {
//         user = new UserModel(payload);
//         await user.save({ session });
//       }

//       await ProfileModel.create(
//         [
//           {
//             name: payload.name ?? "user",
//             email: payload.email!,
//             user_id: user._id,
//           },
//         ],
//         { session }
//       );

//       return {
//         message: "User created successfully.",
//         data: user,
//       };
//     });

//     return result;
//   } catch (error) {
//     console.error("Error creating user:", error);
//     return {
//       message: "User creation failed due to an internal error.",
//       data: null,
//     };
//   } finally {
//     session.endSession();
//   }
// };

const getAllUsers = async () => {
  const result = await UserModel.find();
  return result;
};

const updateProfileData = async (
  user_id: Types.ObjectId,
  payload: Partial<TProfile>,
) => {
  try {
    const updatedProfile = await ProfileModel.findOneAndUpdate(
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
    await UserModel.findOneAndUpdate(
      { _id: user_id },
      { isDeleted: true, email: null },
      { session },
    );
    await ProfileModel.findOneAndUpdate(
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
  const updatedUserProfile = await ProfileModel.findOneAndUpdate(
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
  const profile = await ProfileModel.findOne({ user_id });

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
