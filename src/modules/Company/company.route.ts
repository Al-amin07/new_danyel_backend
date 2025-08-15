import express from 'express';
import { companyController } from './company.controller';

const companyRoute = express.Router();

companyRoute.get('/all', companyController.getAllCompany);

export default companyRoute;
