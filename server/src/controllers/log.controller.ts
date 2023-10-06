import { Request, Response } from 'express';

import { LogService } from '../services';

const getLogs = async (req: Request, res: Response) => {
  const results = await LogService.getLogs();
  res.json({
    status: 'ok',
    logs: results,
  });
};

const getLog = async (req: Request, res: Response) => {
  const { name } = req.params;
  const log = await LogService.getLog(name);
  if (!log) {
    return res.json({
      status: 'error',
      message: 'Log not found.',
    });
  }
  res.json({
    status: 'ok',
    log,
  });
};

const createLog = async (req: Request, res: Response) => {
  const { name, data } = req.body;
  const result = await LogService.createLog({ name, data });

  res.json({
    status: !result ? 'error' : 'ok',
    error: !result ? 'Failed to create log.' : undefined,
  });
};

const deleteLog = async (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) {
    return res.json({
      status: 'error',
      error: 'No log file specified.',
    });
  }

  const log = await LogService.deleteLog(name.toString());
  if (!log) {
    return res.json({
      status: 'error',
      error: `Failed to delete log.`,
    });
  }

  res.json({ status: 'ok' });
};

export const LogController = {
  getLog,
  getLogs,
  createLog,
  deleteLog,
};