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

const sendRequest = async (ipAddr: string, port: number = 8080, actionType: string) => {
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
          //return Base64ImageHeader;
          return { error: false, data: Base64ImageHeader };
        }

        const base64 = Base64ImageHeader + Buffer.from(arrayBuffer).toString('base64');
        //setScreenshot(base64);
        return { error: false, data: base64 };
        // TODO: Send screenshot to backend to save
        //break;
      case 'restart':
        responseData = await response.text();
        break;
      default:
        responseData = await response.json();
        break;
    }

    //setResponse(responseData);
    //return responseData;
    return { error: false, data: responseData };
  } catch (err: any) {
    //setError(err.message);
    return { error: true, message: err.message };
  }
};

export const DeviceService = {
  assignConfig,
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  sendRequest,
};