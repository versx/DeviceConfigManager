import { Application } from 'express';

import { DevicesApiRoute } from '../consts';
import { DeviceController } from '../controllers';
import { ValidateMiddleware } from '../middleware';

export const DeviceRouter = (app: Application) => {
  app.use(ValidateMiddleware)
    .route(DevicesApiRoute)
      .get(DeviceController.getDevices)
      .post(DeviceController.createDevice)
      .put(DeviceController.updateDevice)
      .delete(DeviceController.deleteDevice);

  app.use(ValidateMiddleware)
    .route(`${DevicesApiRoute}/assign`)
      .post(DeviceController.assignConfig);
  
  app.use(ValidateMiddleware)
    .route(`${DevicesApiRoute}/stats`)
      .get(DeviceController.getDeviceStats);
};