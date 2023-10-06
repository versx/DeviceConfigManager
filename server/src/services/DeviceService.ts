import { db } from '../models';
import { DeviceModel } from '../types';

const assignConfig = async (deviceUuid: string, configName: string): Promise<DeviceModel | false> => {
  const device = await getDevice(deviceUuid);
  if (!device) {
    return false;
  }

  const config = await db.config.findByPk(configName);
  if (!config) {
    return false;
  }

  device.set({ config: configName });
  await device.save();
  return device;
};

const getDevices = async (): Promise<DeviceModel[]> => {
  const models = await db.device.findAll({
    //include: [{
    //  model: db.config,
    //  as: 'config',
    //}],
  });
  return models;
};

const getDevice = async (uuid: string) => {
  const model = await db.device.findByPk(uuid);
  console.log('device model type:', typeof model);
  return model;
};

const createDevice = async (payload: DeviceModel): Promise<DeviceModel> => {
  const { uuid } = payload;
  const model = await getDevice(uuid);
  if (model) {
    // Device already exists, return model
    return model;
  }

  const result = await db.device.create(payload);
  return result;
};

const updateDevice = async (uuid: string, payload: DeviceModel): Promise<DeviceModel | false> => {
  const model = await getDevice(uuid);
  if (!model) {
    return false;
  }

  model.set({ ...payload });
  await model.save();
  return model;
};

const deleteDevice = async (uuid: string): Promise<boolean> => {
  const model = await getDevice(uuid);
  model?.destroy();
  return true;
};

export const DeviceService = {
  assignConfig,
  getDevice,
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
};