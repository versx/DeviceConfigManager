import { Application, json, urlencoded } from 'express';
import helmet from 'helmet';

import { AuthRouter } from './auth.routes';
import { ConfigRouter } from './config.routes';
import { DeviceRouter } from './device.routes';
import { LogRouter } from './log.routes';
import { ScheduleRouter } from './schedule.routes';
import { SettingsRouter } from './settings.routes';
import { UserRouter } from './user.routes';
import { ConfigApiRoute } from '../consts';
import { ConfigController, LogController } from '../controllers';
import { BearerTokenMiddleware, LoggingMiddleware } from '../middleware';

export const ApiRouter = (app: Application) => {
  // Initialize helmet basic security middleware
  app.use(helmet());

  // Body method parsers
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true }));

  // Middlewares
  app.use(LoggingMiddleware);

  // Initialize auth routes
  AuthRouter(app);

  app.post(ConfigApiRoute, BearerTokenMiddleware, ConfigController.getConfig);
  app.post('/api/log/new', BearerTokenMiddleware, LogController.createLog);

  // Initialize config routes
  ConfigRouter(app);

  // Initialize device routes
  DeviceRouter(app);

  // Initialize log routes
  LogRouter(app);

  // Initialize schedule routes
  ScheduleRouter(app);

  // Initialize settings routes
  SettingsRouter(app);

  // Initialize user routes
  UserRouter(app);
};