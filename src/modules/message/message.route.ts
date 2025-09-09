import { Router } from 'express';
import { messageController } from './message.controller';
import auth from '../../middleware/auth';
import { userRole } from '../../constents';

const route = Router();

route.post('/', messageController.createMessage);
route.get('/', messageController.getAllMessage);
route.get(
  '/my-message',
  auth(userRole.admin, userRole.company, userRole.driver, userRole.superAdmin),
  messageController.getUserAllConversion,
);
route.get('/inbox/:senderId/:receiverId', messageController.getInboxMessage);

export const messageRoute = route;
