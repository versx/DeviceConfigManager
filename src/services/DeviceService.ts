import { http } from '../modules';
import { Device } from '../types';

const assignConfig = async (deviceUuid: string, configName: string | null) => {
  try {
    const response = await http()
      .post('devices/assign', { deviceUuid, configName });
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const getDevices = async () => {
  try {
    const response = await http()
      .get('devices');
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const createDevice = async (payload: Device) => {
  try {
    const response = await http()
      .post(`devices`, { device: payload });
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const updateDevice = async (uuid: string, payload: Device) => {
  try {
    const response = await http()
      .put(`devices?uuid=${uuid}`, { device: payload });
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const deleteDevice = async (uuid: string) => {
  try {
    const response = await http()
      .delete(`devices?uuid=${uuid}`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

export const DeviceService = {
  assignConfig,
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
};