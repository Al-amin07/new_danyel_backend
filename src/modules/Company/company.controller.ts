import { Request, Response } from 'express';
import catchAsync from '../../util/catchAsync';
import { companyService } from './company.service';
import sendResponse from '../../util/sendResponse';

const getAllCompany = catchAsync(async (req: Request, res: Response) => {
  const result = await companyService.getAllCompanyFromDb();

  sendResponse(res, {
    data: result,
    message: 'Companies retrived successfully',
    success: true,
    statusCode: 200,
  });
});
const getSingleCompany = catchAsync(async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const result = await companyService.getSingleCompany(companyId);

  sendResponse(res, {
    data: result,
    message: 'Company retrived successfully',
    success: true,
    statusCode: 200,
  });
});
const updateCompany = catchAsync(async (req: Request, res: Response) => {
  const { companyId } = req.params;
  const payload = req.body;
  const result = await companyService.updateCompany(companyId, payload);

  sendResponse(res, {
    data: result,
    message: 'Company updated successfully',
    success: true,
    statusCode: 200,
  });
});

export const companyController = {
  getAllCompany,
  getSingleCompany,
  updateCompany,
};
