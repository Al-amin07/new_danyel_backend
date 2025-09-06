import { getIO, onlineUsers } from '../../socket';
import { INotification } from './notification.interface';
import { Notification } from './notification.model';

const sendNotification = async (notification: INotification) => {
  const result = await Notification.create(notification);
  const io = getIO();
  //   const receiverSocketId = onlineUsers[String('68b659c9778a2b206a349ed3')];
  const receiverSocketId = onlineUsers[String(notification?.receiverId)];
  //   console.log({ receiverSocketId, form: notification, onlineUsers });
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('receive_notification', notification);
  }
  return result;
};

const getAllNotification = async () => {
  const result = await Notification.find()
    .populate({
      path: 'senderId',
      select: 'name email profileImage',
    })
    .populate({
      path: 'receiverId',
      select: 'name email profileImage',
    })
    .sort({ createdAt: -1 });
  return result;
};

const getMyNotification = async (id: string) => {
  const result = await Notification.find({ receiverId: id })
    .populate({
      path: 'senderId',
      select: 'name email profileImage',
    })
    .populate({
      path: 'receiverId',
      select: 'name email profileImage',
    })
    .sort({ createdAt: -1 });
  return result;
};

const markNotificationsAsRead = async (loadIds: string[]) => {
  console.log({ loadIds });
  // const result = await Notification.findOne({ id: loadIds[0] });
  const result = await Notification.updateMany(
    { _id: { $in: loadIds } },
    { $set: { isRead: true } },
  );
  return result;
};

export const notificationService = {
  getAllNotification,
  getMyNotification,
  sendNotification,
  markNotificationsAsRead,
};
