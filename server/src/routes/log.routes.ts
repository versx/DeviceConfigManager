import { Application } from 'express';

import { LogsApiRoute } from '../consts';
import { LogController } from '../controllers';
import { ValidateMiddleware } from '../middleware';

export const LogRouter = (app: Application) => {
  app.route('/api/log/new')
    .post(LogController.createLog);

  app.use(ValidateMiddleware)
    .route(LogsApiRoute)
      .get(LogController.getLogs)
      //.post(LogController.createLog)
      .delete(LogController.deleteLog);
};