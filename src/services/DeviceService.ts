import { Base64ImageHeader } from '../consts';
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

const sendDeviceRequest = async (ipAddr: string, port: number = 8080, actionType: string) => {
  try {
    const url = `http://${ipAddr}:${port}/${actionType}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain; charset=x-user-defined',
      },
    });

    let responseData: string = '';
    switch (actionType) {
      case 'screen':
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength <= 0) {
          return { error: false, data: Base64ImageHeader };
        }

        const base64 = Base64ImageHeader + Buffer.from(arrayBuffer).toString('base64');
        // TODO: Send screenshot to backend to save
        return { error: false, data: base64 };
      case 'restart':
        responseData = await response.text();
        break;
      default:
        responseData = await response.json();
        break;
    }
    return { error: false, data: responseData };
  } catch (err: any) {
    return { error: true, message: err.message };
  }
};

const sendAgentRequest = async (payload: any, remoteAgentUrls: string[]) => {
  if (remoteAgentUrls.length === 0) {
    return;
  }

  try {
    for (const remoteAgentUrl of remoteAgentUrls) {
      const response = await fetch(remoteAgentUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('response', response);
    }
  } catch (err: any) {
    console.error(err);
  }
};

export const DeviceService = {
  assignConfig,
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  sendDeviceRequest,
  sendAgentRequest,
};