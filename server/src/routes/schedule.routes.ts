import { Application } from 'express';

import { SchedulesApiRoute } from '../consts';
import { ScheduleController } from '../controllers';
import { ValidateMiddleware } from '../middleware';

export const ScheduleRouter = (app: Application) => {
  app.use(ValidateMiddleware)
    .route(SchedulesApiRoute)
      .get(ScheduleController.getSchedules)
      .post(ScheduleController.createSchedule)
      .put(ScheduleController.updateSchedule)
      .delete(ScheduleController.deleteSchedule);
};