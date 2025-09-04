import { Router } from 'express';
import { notificationController } from './notification.controller';

const route = Router();

route.get('/', notificationController.getAllNotification);
route.post('/', notificationController.sendNotification);
route.get('/:id', notificationController.getMyNotification);

export const notificationRoute = route;
