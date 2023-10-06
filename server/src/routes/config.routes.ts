import { Application } from 'express';

import { ConfigApiRoute, ConfigsApiRoute } from '../consts';
import { ConfigController } from '../controllers';
import { ValidateMiddleware } from '../middleware';

export const ConfigRouter = (app: Application) => {
  app.post(ConfigApiRoute, /* TODO: BearerTokenMiddleware */ ConfigController.getConfig);
  app.put(`${ConfigsApiRoute}/default`, ValidateMiddleware, ConfigController.setDefaultConfig);

  app.use(ValidateMiddleware)
    .route(ConfigsApiRoute)
      .get(ConfigController.getConfigs)
      .post(ConfigController.createConfig)
      .put(ConfigController.updateConfig)
      .delete(ConfigController.deleteConfig);
};