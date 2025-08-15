import { Request, Response } from 'express';
import catchAsync from '../../util/catchAsync';
import { companyService } from './company.service';

const getAllCompany = catchAsync(async (req: Request, res: Response) => {
  const result = await companyService.getAllCompanyFromDb();

  res.status(200).json({
    success: true,
    message: 'Retrive all company',
    body: result,
  });
});

export const companyController = {
  getAllCompany,
};
