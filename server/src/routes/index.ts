import { Application, json, urlencoded } from 'express';
import helmet from 'helmet';

import { AuthRouter } from './auth.routes';
import { ConfigRouter } from './config.routes';
import { DeviceRouter } from './device.routes';
import { ScheduleRouter } from './schedule.routes';
import { SettingsRouter } from './settings.routes';
import { UserRouter } from './user.routes';
import { LoggingMiddleware } from '../middleware';

export const ApiRouter = (app: Application) => {
  // Initialize helmet basic security middleware
  app.use(helmet());

  // Body method parsers
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true }));

  // Middlewares
  app.use(LoggingMiddleware);

  // Initialize auth routes
  AuthRouter(app);

  // Initialize config routes
  ConfigRouter(app);

  // Initialize device routes
  DeviceRouter(app);

  // Initialize schedule routes
  ScheduleRouter(app);

  // Initialize settings routes
  SettingsRouter(app);

  // Initialize user routes
  UserRouter(app);
};