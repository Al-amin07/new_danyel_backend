import express from 'express';
import authRouter from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import companyRoute from '../modules/Company/company.route';
import profileRoute from '../modules/Profile/profile.route';
import driverRoute from '../modules/Driver/driver.route';
import { loadRoute } from '../modules/load/load.route';
import { supportRoute } from '../modules/support/support.route';
import { messageRoute } from '../modules/message/message.route';

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
  {
    path: '/support',
    router: supportRoute,
  },
  {
    path: '/message',
    router: messageRoute,
  },
];

moduleRouts.forEach(({ path, router }) => {
  Routes.use(path, router);
});

export default Routes;
