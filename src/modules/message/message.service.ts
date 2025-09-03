import { Types } from 'mongoose';
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
  senderId: Types.ObjectId;
  receiver: Types.ObjectId;
}) => {
  const result = await Message.find({
    sender: payload?.senderId,
    receiver: payload?.receiver,
  })
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

export const MessageService = {
  createMessage,
  getAllMessage,
  getInboxMessage,
};
