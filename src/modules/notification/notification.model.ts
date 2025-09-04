import { model, Schema } from 'mongoose';
import { INotification } from './notification.interface';

const notificationSchema = new Schema<INotification>(
  {
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['message', 'task', 'alert', 'system'],
      default: 'message',
    },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    load: { type: Schema.Types.ObjectId, ref: 'Load' },
  },
  { timestamps: true },
);

export const Notification = model<INotification>(
  'Notification',
  notificationSchema,
);
