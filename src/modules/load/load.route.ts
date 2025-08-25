import { Router } from 'express';
import { loadController } from './load.controller';
import { upload } from '../../util/uploadImgToCloudinary';

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

route.patch('/:loadId/assign-driver', loadController.aassignDriverToLoad);

export const loadRoute = route;
