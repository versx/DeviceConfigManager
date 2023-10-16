import { Application } from 'express';

import { AuthApiRoute } from '../consts';
import { AuthController } from '../controllers';
import { ValidateMiddleware } from '../middleware';

export const AuthRouter = (app: Application) => {
  app.post(`${AuthApiRoute}/login`, AuthController.login);
  app.post(`${AuthApiRoute}/register`, AuthController.register);

  app.use(ValidateMiddleware)
    .route(`${AuthApiRoute}/refresh`)
      .post(AuthController.refreshTokens);
};