import { Types } from 'mongoose';
import { ILoad } from '../load/load.interface';

export interface INotification {
  receiverId?: Types.ObjectId;
  senderId?: Types.ObjectId; // optional, e.g. system notifications
  type: 'message' | 'task' | 'alert' | 'system';
  content: string;
  isRead?: boolean;
  load?: Types.ObjectId;
}
