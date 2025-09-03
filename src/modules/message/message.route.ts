import { Router } from 'express';
import { messageController } from './message.controller';

const route = Router();

route.get('/', messageController.getAllMessage);
route.get('/inbox', messageController.getInboxMessage);

export const messageRoute = route;
