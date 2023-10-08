import { Application } from 'express';

import { LogsApiRoute } from '../consts';
import { LogController } from '../controllers';
import { ValidateMiddleware } from '../middleware';

export const LogRouter = (app: Application) => {
  app.post('/api/log/new', LogController.createLog);

  app.use(ValidateMiddleware)
    .route(LogsApiRoute)
      .get(LogController.getLogs)
      //.post(LogController.createLog)
      .delete(LogController.deleteLog);
};