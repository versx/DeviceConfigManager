import { Application } from 'express';

import { AuthApiRoute } from '../consts';
import { AuthController } from '../controllers';

export const AuthRouter = (app: Application) => {
  app.post(`${AuthApiRoute}/login`, AuthController.login);
  app.post(`${AuthApiRoute}/register`, AuthController.register);
};