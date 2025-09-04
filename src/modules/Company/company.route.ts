import express from 'express';
import { companyController } from './company.controller';
import auth from '../../middleware/auth';
import { userRole } from '../../constents';

const companyRoute = express.Router();

companyRoute.get('/', companyController.getAllCompany);
companyRoute.get(
  '/myload',
  auth(userRole.company),
  companyController.getAllLoadOfCompany,
);
companyRoute.get('/:companyId', companyController.getSingleCompany);
companyRoute.patch('/:companyId', companyController.updateCompany);

export default companyRoute;
