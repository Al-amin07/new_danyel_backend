import express from 'express';
import { upload } from '../../util/uploadImgToCloudinary';
import { driverController } from './driver.controller';
import auth from '../../middleware/auth';
import { userRole } from '../../constents';

const driverRoute = express.Router();

driverRoute.patch(
  '/update-profile',
  auth(userRole.driver),
  upload.fields([
    { name: 'nidOrPassport', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'vehicleRegistration', maxCount: 1 },
  ]),
  (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  driverController.updateDriverProfile,
);

export default driverRoute;
