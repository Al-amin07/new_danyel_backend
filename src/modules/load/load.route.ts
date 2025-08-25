import { Router } from 'express';
import { loadController } from './load.controller';
import { upload } from '../../util/uploadImgToCloudinary';
import auth from '../../middleware/auth';
import { userRole } from '../../constents';
import validator from '../../middleware/validator';
import { loadStatusValidationSchema } from './load.validation';

const route = Router();

route.post(
  '/create-load',
  upload.array('documents', 10),
  (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  loadController.createLoad,
);

route.get('/', loadController.getAllLoad);

route.get('/generate-loadId', loadController.generateLoadId);
route.get('/:loadId', loadController.getSingleLoad);
route.patch(
  '/:loadId',
  upload.array('documents', 10),
  (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  loadController.updateLoad,
);

route.patch(
  '/:loadId/assign-driver',
  auth(userRole.admin),
  loadController.aassignDriverToLoad,
);

route.patch(
  `/:loadId/update-load-status`,
  validator(loadStatusValidationSchema),
  auth(userRole.admin, userRole.company),
  loadController.updateLoadStatus,
);

export const loadRoute = route;
