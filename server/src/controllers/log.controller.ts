import { Request, Response } from 'express';

import { LogService } from '../services';

const getLogs = (req: Request, res: Response) => {
  const results = LogService.getLoggers();
  res.json({
    status: 'ok',
    logs: results,
  });
};

const getLog = (req: Request, res: Response) => {
  const { name } = req.params;
  const log = LogService.getLogger(name);
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

const createLog = (req: Request, res: Response) => {
  const { uuid, messages } = req.body;
  const logger = LogService.getLogger(uuid);

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.includes('Initializing')) {
      // TODO: Add device restarts to Device model
      //const result = await Stats.counter(uuid + '-' + today + '-gamerestarts');
      logger.info(message);
      continue;
    }
    logger.info(message);
  }

  res.json({ status: 'ok' });
};

const deleteLog = (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) {
    return res.json({
      status: 'error',
      error: 'No log file specified.',
    });
  }

  const log = LogService.deleteLogger(name.toString());
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