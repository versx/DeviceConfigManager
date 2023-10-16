import { db } from '../models';
import { SettingModel } from '../types';
import { logError } from './LoggingService';

const getSettings = async (): Promise<SettingModel[]> => {
  const models = await db.setting.findAll();
  return models;
};

const getSetting = async (name: string): Promise<SettingModel> => {
  const model = await db.setting.findByPk(name);
  return model;
};

const setSettings = async (settings: SettingModel[]): Promise<boolean> => {
  let error = false;
  for (const setting of settings) {
    const model = await db.setting.findByPk(setting.name);
    if (!model) {
      db.setting.create(setting);
      continue;
    }
  
    try {
      model.set(setting);
      await model.save();
    } catch (err) {
      logError(err);
      error = true;
    }
  }
  return !error;
};

const setSetting = async (setting: SettingModel): Promise<boolean> => {
  const model = await db.setting.findByPk(setting.name);
  if (!model) {
    db.setting.create(setting);
    return true;
  }

  try {
    model.set(setting);
    await model.save();

    return true;
  } catch (err) {
    logError(err);
    return false;
  }
};

export const SettingsService = {
  getSettings,
  getSetting,
  setSettings,
  setSetting,
};