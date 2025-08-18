import express from 'express';
import authRouter from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import companyRoute from '../modules/Company/company.route';
import profileRoute from '../modules/Profile/profile.route';
import driverRoute from '../modules/Driver/driver.route';
import { loadRoute } from '../modules/load/load.route';

const Routes = express.Router();
// Array of module routes
const moduleRouts = [
  {
    path: '/auth',
    router: authRouter,
  },
  {
    path: '/users',
    router: userRoutes,
  },
  {
    path: '/profile',
    router: profileRoute,
  },
  {
    path: '/company',
    router: companyRoute,
  },
  {
    path: '/driver',
    router: driverRoute,
  },
  {
    path: '/load',
    router: loadRoute,
  },
];

moduleRouts.forEach(({ path, router }) => {
  Routes.use(path, router);
});

export default Routes;
