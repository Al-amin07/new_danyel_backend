import express from 'express';
import { companyController } from './company.controller';

const companyRoute = express.Router();

companyRoute.get('/', companyController.getAllCompany);
companyRoute.get('/:companyId', companyController.getSingleCompany);
companyRoute.patch('/:companyId', companyController.updateCompany);

export default companyRoute;
