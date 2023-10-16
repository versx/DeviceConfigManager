import { Application } from 'express';

import { ConfigsApiRoute } from '../consts';
import { ConfigController } from '../controllers';
import { ValidateMiddleware } from '../middleware';

export const ConfigRouter = (app: Application) => {
  app.put(`${ConfigsApiRoute}/default`, ValidateMiddleware, ConfigController.setDefaultConfig);

  app.use(ValidateMiddleware)
    .route(ConfigsApiRoute)
      .get(ConfigController.getConfigs)
      .post(ConfigController.createConfig)
      .put(ConfigController.updateConfig)
      .delete(ConfigController.deleteConfig);
};