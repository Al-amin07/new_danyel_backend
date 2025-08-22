import express from 'express';
import userController from './user.controller';
import { userRole } from '../../constents';
import auth from '../../middleware/auth';
// import { upload } from '../../util/uploadImgToCloudinary';

const userRoutes = express.Router();

// users routes
userRoutes.post('/create-company', userController.createCompany);

// userRoutes.patch(
//   '/updateProfileData',
//   auth(userRole.admin, userRole.company, userRole.driver),
//   userController.updateProfileData,
// );
// userRoutes.delete(
//   '/selfDistuct',
//   auth(userRole.admin, userRole.company, userRole.driver),
//   userController.selfDistuct,
// );
// // userRoutes.post(
// //   '/uploadOrChangeImg',
// //   auth(userRole.admin, userRole.company, userRole.driver),
// //   upload.single('files'),
// //   userController.uploadOrChangeImg,
// // );

// userRoutes.get(
//   '/getProfile',
//   auth(userRole.admin, userRole.company, userRole.driver),
//   userController.getProfile,
// );

// admin routes
userRoutes.get(
  '/getAlluser',
  auth(userRole.admin, userRole.company, userRole.driver),
  userController.getAllUsers,
);
// userRoutes.delete(
//   '/deleteSingleUser',
//   auth(userRole.admin),
//   userController.deleteSingleUser,
// );

export default userRoutes;
