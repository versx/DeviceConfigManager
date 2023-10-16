import { Request, Response } from 'express';

import { DeviceService } from '../services';

const assignConfig = async (req: Request, res: Response) => {
  const { deviceUuid, configName } = req.body;
  const result = await DeviceService.assignConfig(deviceUuid, configName);
  res.json({
    status: !result ? 'error' : 'ok',
    error: !result ? 'Failed to assign config.' : undefined,
    device: !result ? undefined : result,
  });
};

const getDevices = async (req: Request, res: Response) => {
  const results = await DeviceService.getDevices();
  res.json({
    status: 'ok',
    devices: results,
  });
};

const getDevice = async (req: Request, res: Response) => {
  const { uuid } = req.params;
  const device = await DeviceService.getDevice(uuid);
  if (!device) {
    return res.json({
      status: 'error',
      message: 'Device not found.',
    });
  }
  res.json({
    status: 'ok',
    device,
  });
};

const createDevice = async (req: Request, res: Response) => {
  const { device } = req.body;
  const result = await DeviceService.createDevice(device);

  res.json({
    status: !result ? 'error' : 'ok',
    error: !result ? 'Failed to create device.' : undefined,
    device: !result ? undefined : result,
  });
};

const updateDevice = async (req: Request, res: Response) => {
  const { uuid } = req.query;
  const { device } = req.body;
  const result = await DeviceService.updateDevice(uuid?.toString()!, device);

  res.json({
    status: !result ? 'error' : 'ok',
    error: !result ? 'Failed to update device.' : undefined,
    device: !result ? undefined : result,
  });
};

const deleteDevice = async (req: Request, res: Response) => {
  const { uuid } = req.query;
  if (!uuid) {
    return res.json({
      status: 'error',
      error: 'No device uuid specified.',
    });
  }

  const device = await DeviceService.deleteDevice(uuid.toString());
  if (!device) {
    return res.json({
      status: 'error',
      error: `Failed to delete device.`,
    });
  }

  res.json({ status: 'ok' });
};

const getDeviceStats = async (req: Request, res: Response) => {
  const { uuid, date } = req.query;
  const stats = await DeviceService.getDeviceStats(uuid?.toString() ?? '', date?.toString() ?? '');
  if (!stats) {
    return res.json({
      status: 'error',
      error: `Failed to get device stats.`,
    });
  }

  res.json({ status: 'ok', stats });
};

export const DeviceController = {
  assignConfig,
  getDevice,
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceStats,
};