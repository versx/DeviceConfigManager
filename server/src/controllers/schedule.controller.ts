import { Request, Response } from 'express';

import { ScheduleService } from '../services';

const getSchedules = async (req: Request, res: Response) => {
  const results = await ScheduleService.getSchedules();
  res.json({
    status: 'ok',
    schedules: results,
  });
};

const createSchedule = async (req: Request, res: Response) => {
  //const { name, provider, backendUrl, dataEndpoints, bearerToken, enabled } = req.body;
  //const result = await ScheduleService.createSchedule({
  //  name,
  //  provider,
  //  backendUrl,
  //  dataEndpoints,
  //  bearerToken,
  //  default: req.body.default,
  //  enabled,
  //});
//
  //res.json({
  //  status: !result ? 'error' : 'ok',
  //  error: !result ? 'Failed to create schedule.' : undefined,
  //  schedule: !result ? undefined : result,
  //});
};

const updateSchedule = async (req: Request, res: Response) => {
  //const { name } = req.query;
  //const { provider, backendUrl, dataEndpoints, bearerToken, enabled } = req.body;
  //const result = await ScheduleService.updateSchedule(name?.toString()!, {
  //  name: name?.toString()!,
  //  provider,
  //  backendUrl,
  //  dataEndpoints,
  //  bearerToken,
  //  default: req.body.default,
  //  enabled,
  //});

  //res.json({
  //  status: !result ? 'error' : 'ok',
  //  error: !result ? 'Failed to update schedule.' : undefined,
  //  schedule: !result ? undefined : result,
  //});
};

const deleteSchedule = async (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) {
    return res.json({
      status: 'error',
      error: 'No schedule specified.',
    });
  }

  const config = await ScheduleService.deleteSchedule(name.toString());
  if (!config) {
    return res.json({
      status: 'error',
      error: `Failed to delete schedule.`,
    });
  }

  res.json({ status: 'ok' });
};

export const ScheduleController = {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};