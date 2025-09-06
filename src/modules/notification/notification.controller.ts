import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../util/catchAsync';
import sendResponse from '../../util/sendResponse';
import { notificationService } from './notification.service';

const getAllNotification = catchAsync(async (req, res) => {
  const result = await notificationService.getAllNotification();
  sendResponse(res, {
    data: result,
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notifications retrived successfully',
  });
});
const sendNotification = catchAsync(async (req, res) => {
  const result = await notificationService.sendNotification(req.body);
  sendResponse(res, {
    data: result,
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notifications send successfully',
  });
});
const getMyNotification = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await notificationService.getMyNotification(id);
  sendResponse(res, {
    data: result,
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notifications retrived successfully',
  });
});
const markNotificationsAsRead = catchAsync(async (req, res) => {
  const { loads } = req.body;
  const result = await notificationService.markNotificationsAsRead(loads);
  sendResponse(res, {
    data: result,
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Notifications updated successfully',
  });
});

export const notificationController = {
  getAllNotification,
  getMyNotification,
  sendNotification,
  markNotificationsAsRead,
};
