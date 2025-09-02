import { Request, Response } from 'express';
import catchAsync from '../../util/catchAsync';
import { driverService } from './driver.service';
import { JwtPayload } from 'jsonwebtoken';
import sendResponse from '../../util/sendResponse';

const updateDriverProfile = catchAsync(async (req: Request, res: Response) => {
  const id = (req.user as JwtPayload).id;
  const data = req.body;
  const file = req.file;
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  const result = await driverService.updateDriverProfileIntoDb(
    id,
    data,

    files,
  );
  sendResponse(res, {
    success: true,
    message: 'Driver profile updated successfully',
    data: result,
    statusCode: 200,
  });
});
const assignLoadToDriver = catchAsync(async (req: Request, res: Response) => {
  const id = (req.user as JwtPayload).id;
  const { loadId } = req.body;

  const result = await driverService.assignLoadToDriver(id, loadId);
  sendResponse(res, {
    success: true,
    message: 'Load assigned to driver successfully',
    data: result,
    statusCode: 200,
  });
});
const updateLoadStatus = catchAsync(async (req: Request, res: Response) => {
  const id = (req.user as JwtPayload).id;
  console.log({ id, body: req.body });
  const result = await driverService.updateLoadStatus(id, req.body);
  sendResponse(res, {
    success: true,
    message: 'Load assigned to driver successfully',
    data: result,
    statusCode: 200,
  });
});
const reviewDriver = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await driverService.reviewDriver(id, req.body);
  sendResponse(res, {
    success: true,
    message: 'Review added successfully!!!',
    data: result,
    statusCode: 200,
  });
});
const getAllDriver = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await driverService.getAllDriver(query);
  sendResponse(res, {
    success: true,
    message: 'Drivers retrived successfully!!!',
    data: result.data,
    meta: result.meta,
    statusCode: 200,
  });
});

const updateDriverStatus = catchAsync(async (req: Request, res: Response) => {
  const id = (req.user as JwtPayload).id;
  console.log({ id, body: req.body });
  const result = await driverService.updateDriverStatus(id, req.body);
  sendResponse(res, {
    success: true,
    message: 'Driver status updated successfully',
    data: result,
    statusCode: 200,
  });
});

export const driverController = {
  updateDriverProfile,
  assignLoadToDriver,
  updateLoadStatus,
  reviewDriver,
  getAllDriver,
  updateDriverStatus,
};
