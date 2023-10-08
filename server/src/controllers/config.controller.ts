import { Request, Response } from 'express';

import config from '../config.json';
import {
  ConfigService, DeviceService,
  getIpAddress,
  log, logDebug, logError, logWarn,
} from '../services';

const getConfigs = async (req: Request, res: Response) => {
  const results = await ConfigService.getConfigs();
  res.json({
    status: 'ok',
    configs: results,
  });
};

const getConfig = async (req: Request, res: Response) => {
  const { uuid, ios_version, ipa_version, model, webserver_port } = req.body;
  let noConfig = false;
  let assignDefault = false;
  // Check for a proxied IP before the normal IP and set the first one that exists
  const ipAddr = await getIpAddress(req, '127.0.0.1');
  log(`[${uuid}, ${ipAddr}] Is requesting a config.`);

  let device = await DeviceService.getDevice(uuid);
  // Check if device config is set, if not provide it as json response
  if (device) {
    // Device exists
    device.lastSeen = new Date(); //convertTz(new Date()) / 1000;
    // Only update client IP if it hasn't been set yet or if auto sync is
    // enabled while IP doesn't match.
    if ((!device.ipAddr || device.ipAddr !== ipAddr) && config.autoSyncIP) {
      device.ipAddr = ipAddr;
    }
    device.iosVersion = ios_version;
    device.ipaVersion = ipa_version;
    device.webserverPort = webserver_port;
    if (device.model === null) {
      device.model = model;
    }
    await device.save();
    if (device.config) {
      // Nothing to do besides respond with config
    } else {
      logWarn(`Device ${uuid} not assigned a config, attempting to assign the default config if one is set...`);
      // Not assigned a config
      assignDefault = true;
    }
  } else {
    logDebug('Device does not exist, creating...');
    // Device doesn't exist, create db entry
    device = await DeviceService.createDevice({
      uuid,
      config: null,
      model,
      ipAddr,
      iosVersion: ios_version,
      ipaVersion: ipa_version,
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
    logError(`Device '${uuid}' is not enabled!`);
    return res.json({
      status: 'error',
      error: 'Device is not enabled!'
    });
  }  

  if (assignDefault) {
    const defaultConfig = await ConfigService.getDefaultConfig();
    if (defaultConfig) {
      log(`Assigning device ${uuid} default config ${defaultConfig.name}`);
      device.config = defaultConfig.name;
      await device.save();
    } else {  
      // No default config so don't give config response
      noConfig = true;
    }
  }

  if (noConfig) {
    logError(`No config assigned to device ${uuid} and no default config is set!`);
    return res.json({
      status: 'error',
      error: 'Device not assigned to config!'
    });
  }
  
  if (!await ConfigService.getConfig(device.config)) {
    logError(`Failed to grab config ${device.config}`);
    return res.json({
      status: 'error',
      error: 'Device not assigned to config!'
    });
  }

  const cfg = await ConfigService.getConfig(device.config);
  log(`[${uuid}, ${ipAddr}] Config response: ${cfg}`);
  res.json({
    status: 'ok',
    config: {
      backend_url: cfg.backendUrl,
      data_endpoints: cfg.dataEndpoints,
      backend_secret_token: cfg.bearerToken,
    },
  });
};

const createConfig = async (req: Request, res: Response) => {
  const { config } = req.body;
  const result = await ConfigService.createConfig(config);

  res.json({
    status: !result ? 'error' : 'ok',
    error: !result ? 'Failed to create config.' : undefined,
    config: !result ? undefined : result,
  });
};

const updateConfig = async (req: Request, res: Response) => {
  const { name } = req.query;
  const { config } = req.body;
  const result = await ConfigService.updateConfig(name?.toString()!, config);

  res.json({
    status: !result ? 'error' : 'ok',
    error: !result ? 'Failed to update config.' : undefined,
    config: !result ? undefined : result,
  });
};

const deleteConfig = async (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) {
    return res.json({
      status: 'error',
      error: 'No config specified.',
    });
  }

  const config = await ConfigService.deleteConfig(name.toString());
  if (!config) {
    return res.json({
      status: 'error',
      error: `Failed to delete config.`,
    });
  }

  res.json({ status: 'ok' });
};

const setDefaultConfig = async (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) {
    return res.json({
      status: 'error',
      error: 'No config specified.',
    });
  }

  const config = await ConfigService.setDefaultConfig(name.toString());
  if (!config) {
    return res.json({
      status: 'error',
      error: `Failed to set default config.`,
    });
  }

  res.json({ status: 'ok', config });
};

const getDefaultConfig = async (req: Request, res: Response) => {
  const config = await ConfigService.getDefaultConfig();
  if (!config) {
    return res.json({
      status: 'error',
      error: `Failed to get default config.`,
    });
  }

  res.json({ status: 'ok', config });
};

export const ConfigController = {
  getConfig,
  getConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  getDefaultConfig,
  setDefaultConfig,
};