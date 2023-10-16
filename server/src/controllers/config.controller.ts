import { Request, Response } from 'express';

import config from '../config.json';
import { DefaultWebServerPort } from '../consts';
import { ConfigService, getIpAddress, logDebug } from '../services';

const getConfig = async (req: Request, res: Response) => {
  const { uuid, model, ios_version, ipa_version, webserver_port } = req.body;
  logDebug(`[${uuid}] Is requesting a config...`);

  // Check for a proxied IP before the normal IP and set the first one that exists
  const ipAddr = await getIpAddress(req, '127.0.0.1');
  const device = {
    uuid,
    model,
    ipAddr,
    iosVersion: ios_version,
    ipaVersion: ipa_version,
    webserverPort: webserver_port ?? DefaultWebServerPort,
  };
  const response = await ConfigService.getDeviceConfig(device, config.autoSyncIP);
  logDebug(`[${uuid}] Config response: ${JSON.stringify(response)}`);
  res.json(response);
};

const getConfigs = async (req: Request, res: Response) => {
  const results = await ConfigService.getConfigs();
  res.json({
    status: 'ok',
    configs: results,
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