import {
  DeviceService,
  logDebug, logError, logWarn,
} from '.';
import { DefaultWebServerPort } from '../consts';
import { db } from '../models';
import { ConfigModel, DeviceModel } from '../types';

const getConfigs = async (): Promise<any[]> => {
  const models = await db.config.findAll();
  return models;
};

const getConfig = async (name: string) => {
  const model = await db.config.findByPk(name);
  return model;
};

const createConfig = async (payload: ConfigModel): Promise<ConfigModel> => {
  const { name } = payload;
  const model = await getConfig(name);
  if (model) {
    // Config already exists, return model
    return model;
  }

  const result = await db.config.create(payload);
  return result;
};

const updateConfig = async (name: string, payload: ConfigModel): Promise<ConfigModel | false> => {
  const model = await getConfig(name);
  if (!model) {
    return false;
  }

  model.set({ ...payload });
  await model.save();
  return model;
};

const deleteConfig = async (name: string): Promise<boolean> => {
  const model = await getConfig(name);
  model?.destroy();
  return true;
};

const getDefaultConfig = async () => {
  const model = await db.config.findOne({
    where: {
      default: true,
    },
    limit: 1,
  });
  return model;
};

const setDefaultConfig = async (name: string): Promise<ConfigModel | false> => {
  const model = await getConfig(name);
  if (!model) {
    return false;
  }

  const configs = await getConfigs();
  for (const config of configs) {
    config.set({
      default: config.name === name,
    });
    await config.save();
  }
  return model;
};

const getDeviceConfig = async (model: DeviceModel, autoSyncIP: boolean) => {
  let noConfig = false;
  let assignDefault = false;
  let device = await DeviceService.getDevice(model.uuid);

  // Check if device config is set, if not provide it as json response
  if (device) {
    logDebug(`[${model.uuid}] Device exists, updating...`);
    // Device exists
    device.lastSeen = new Date(); //convertTz(new Date()) / 1000;
    // Only update client IP if it hasn't been set yet or if auto sync is
    // enabled while IP doesn't match.
    if (model.ipAddr && (!device.ipAddr || device.ipAddr !== model.ipAddr) && autoSyncIP) {
      device.ipAddr = model.ipAddr;
    }
    device.iosVersion = model.iosVersion;
    device.ipaVersion = model.ipaVersion;
    device.webserverPort = 8080; // TODO: model.webserverPort;
    if (!device.model) {
      device.model = model;
    }
    await device.save();

    if (!device.config) {
      logWarn(`[${model.uuid}] Device is not assigned a config, attempting to assign the default config if one is set...`);
      // Not assigned a config
      assignDefault = true;
    }
  } else {
    logDebug(`[${model.uuid}] Device does not exist, creating...`);
    // Device doesn't exist, create db entry
    device = await DeviceService.createDevice({
      uuid: model.uuid,
      config: null,
      model: model.model,
      ipAddr: autoSyncIP ? model.ipAddr : null,
      iosVersion: model.iosVersion,
      ipaVersion: model.ipaVersion,
      notes: null,
      lastSeen: new Date(),
      enabled: true,
    });
    if (device) {
      // Success, assign default config if there is one.
      assignDefault = true;
    } else {
      // Failed to create device so don't give config response
      noConfig = true;
    }
  }

  if (!device.enabled) {
    logWarn(`[${model.uuid}] Device is not enabled!`);
    return {
      status: 'error',
      error: 'Device is not enabled!'
    };
  }  

  if (assignDefault) {
    const defaultConfig = await ConfigService.getDefaultConfig();
    if (defaultConfig) {
      logDebug(`[${model.uuid}] Assigning device to default config ${defaultConfig.name}`);
      device.config = defaultConfig.name;
      await device.save();
    } else {  
      // No default config so don't give config response
      noConfig = true;
    }
  }

  if (noConfig) {
    logError(`[${model.uuid}] No config assigned to device and no default config is set!`);
    return {
      status: 'error',
      error: 'Device not assigned to config!'
    };
  }
  
  const cfg = await ConfigService.getConfig(device.config);
  if (!cfg) {
    logError(`[${model.uuid}] Failed to grab config ${device.config}`);
    return {
      status: 'error',
      error: 'Device not assigned to config!'
    };
  }

  return {
    backend_url: cfg.backendUrl,
    data_endpoints: cfg.dataEndpoints,
    backend_secret_token: cfg.bearerToken ?? '',
    webserver_port: DefaultWebServerPort,
  };
}

export const ConfigService = {
  getConfig,
  getConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  getDefaultConfig,
  setDefaultConfig,
  getDeviceConfig,
};