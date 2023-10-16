import { Request, Response } from 'express';

import { generateETag, SettingsService } from '../services';
import { SettingModel } from '../types';

let cachedSettings: SettingModel[] = [];

const getSettings = async (req: Request, res: Response) => {
  const clientETag = req.header('If-None-Match');
  const currentETag = generateETag(cachedSettings);

  // Compare client's ETag with current ETag
  if (clientETag === currentETag) {
    // No changes, send Not Modified
    //res.status(304).end();
    res.setHeader('ETag', currentETag);
    return res.json({
      status: 'ok',
      settings: cachedSettings,
    });
  }

  cachedSettings = await SettingsService.getSettings();

  const etag = generateETag(cachedSettings);
  res.setHeader('ETag', etag);
  res.json({
    status: 'ok',
    settings: cachedSettings,
  });
};

const setSettings = async (req: Request, res: Response) => {
  const { settings } = req.body;
  const result = await SettingsService.setSettings(settings);
  if (!result) {
    return res.json({
      status: 'error',
      error: `Failed to set settings '${settings}'`,
    });
  }

  const newSettings = await SettingsService.getSettings();
  cachedSettings = newSettings;

  const etag = generateETag(cachedSettings);
  res.setHeader('ETag', etag);
  res.json({
    status: 'ok',
    settings: cachedSettings,
  });
};

export const SettingsController = {
  settings: cachedSettings,
  getSettings,
  setSettings,
};