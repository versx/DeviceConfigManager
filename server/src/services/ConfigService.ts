import { db } from '../models';
import { ConfigModel } from '../types';

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
      limit: 1,
    },
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

export const ConfigService = {
  getConfig,
  getConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  getDefaultConfig,
  setDefaultConfig,
};