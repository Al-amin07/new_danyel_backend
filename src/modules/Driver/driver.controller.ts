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

export const driverController = {
  updateDriverProfile,
  assignLoadToDriver,
  updateLoadStatus,
};
