import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../util/catchAsync';
import sendResponse from '../../util/sendResponse';
import { MessageService } from './message.service';

const createMessage = catchAsync(async (req, res) => {
  const result = await MessageService.createMessage(req.body);
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Message  created successfully',
  });
});
const getAllMessage = catchAsync(async (req, res) => {
  const result = await MessageService.getAllMessage();
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Messages  retrived successfully',
  });
});
const getInboxMessage = catchAsync(async (req, res) => {
  const senderId = req.params.senderId;
  const receiverId = req.params.receiverId;
  const result = await MessageService.getInboxMessage({ senderId, receiverId });
  sendResponse(res, {
    data: result,
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Messages  retrived successfully',
  });
});

export const messageController = {
  createMessage,
  getAllMessage,
  getInboxMessage,
};
