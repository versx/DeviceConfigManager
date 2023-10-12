import { Application } from 'express';

import { UsersApiRoute } from '../consts';
import { UserController } from '../controllers';
import { AdminMiddleware, ValidateMiddleware } from '../middleware';

export const UserRouter = (app: Application) => {
  app.use(ValidateMiddleware)
    .route(UsersApiRoute)
      .get(AdminMiddleware, UserController.getUsers)
      .post(AdminMiddleware, UserController.createUser)
      .put(AdminMiddleware, UserController.updateUser)
      .delete(AdminMiddleware, UserController.deleteUser);

  app.get(`${UsersApiRoute}/:id`, UserController.getUser);
  app.post(`${UsersApiRoute}/:id/password/reset`, UserController.changePassword);
};