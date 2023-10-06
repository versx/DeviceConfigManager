import { http } from '../modules';
import { Setting } from '../types';

const getSettings = async () => {
  try {
    const response = await http()
      .get('settings');
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const setSettings = async (settings: Setting[]) => {
  try {
    const response = await http()
      .put('settings', { settings });
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

export const SettingsService = {
  getSettings,
  setSettings,
};