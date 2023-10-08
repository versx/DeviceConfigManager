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
  console.log('createLog:', req.body);
  //const { uuid, messages } = req.body;
  //const result = await LogService.createLog({ name, data });

  //for (let i = messages.length - 1; i >= 0; i--) {
  //  // TODO: Log to file
  //  if (messages[i].includes('Initializing')) {
  //    const date = new Date(); //utils.convertTz(new Date());
  //    const today = date.toLocaleString('YYYY-M-D');
  //    //const today = date.format('YYYY-M-D');
  //    //const result = await Stats.counter(uuid + '-' + today + '-gamerestarts');
  //    //if (result) {
  //      // Success
  //    //}
  //    //console.log('[RESTART]', messages[i]);
  //  }
  //  //console.log('[SYSLOG]', messages[i]);
  //}

  const result = true;
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