import mongoose, { Types } from 'mongoose';
import { IMessage } from './message.interface';
import { Message } from './message.model';

const createMessage = async (payload: IMessage) => {
  const result = await Message.create(payload);
  return result;
};

const getAllMessage = async () => {
  const result = await Message.find({})
    .populate({
      path: 'sender',
      select: 'name email',
    })
    .populate({
      path: 'receiver',
      select: 'name email',
    })
    .sort({ createdAt: -1 })
    .exec();
  return result;
};
const getInboxMessage = async (payload: {
  senderId: string;
  receiverId: string;
}) => {
  console.log({ payload });

  const messages = await Message.find({
    $or: [
      {
        sender: new mongoose.Types.ObjectId(payload?.senderId),
        receiver: new mongoose.Types.ObjectId(payload?.receiverId),
      },
      {
        sender: new mongoose.Types.ObjectId(payload?.receiverId),
        receiver: new mongoose.Types.ObjectId(payload?.senderId),
      },
    ],
  })
    .populate({
      path: 'sender',
      select: 'name email profileImage',
    })
    .populate({
      path: 'receiver',
      select: 'name email profileImage',
    })
    .sort({ createdAt: 1 });
  return messages;
};

export const MessageService = {
  createMessage,
  getAllMessage,
  getInboxMessage,
};
