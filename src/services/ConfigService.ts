import { http } from '../modules';
import { Config } from '../types';

const getConfigs = async () => {
  try {
    const response = await http()
      .get('configs');
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const createConfig = async (payload: Config) => {
  try {
    const response = await http()
      .post(`configs`, payload);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const updateConfig = async (name: string, payload: Config) => {
  try {
    const response = await http()
      .put(`configs?name=${name}`, payload);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const deleteConfig = async (name: string) => {
  try {
    const response = await http()
      .delete(`configs?name=${name}`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const setDefaultConfig = async (name: string) => {
  try {
    const response = await http()
      .put(`configs/default?name=${name}`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

export const ConfigService = {
  getConfigs,
  createConfig,
  updateConfig,
  deleteConfig,
  setDefaultConfig,
};