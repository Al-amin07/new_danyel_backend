import { Request, Response } from 'express';
import catchAsync from '../../util/catchAsync';
import { driverService } from './driver.service';
import { JwtPayload } from 'jsonwebtoken';
import sendResponse from '../../util/sendResponse';

const updateDriverProfile = catchAsync(async (req: Request, res: Response) => {
  const id = (req.user as JwtPayload).id;
  const data = req.body;
  const files = req.files as {
    [fieldname: string]: Express.Multer.File[];
  };

  const driver = await driverService.updateDriverProfileIntoDb(id, data, files);
  sendResponse(res, {
    success: true,
    message: 'Driver profile created successfully',
    data: driver,
    statusCode: 200,
  });
});

export const driverController = {
  updateDriverProfile,
};
