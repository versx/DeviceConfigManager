import { Request, Response } from 'express';

import { DeviceService, formatDate, LogService } from '../services';

const getLogs = (req: Request, res: Response) => {
  const { uuid } = req.query;
  const { logs, archives } = LogService.getLogs(uuid?.toString()!, true);

  res.json({
    status: 'ok',
    logs,
    archives,
  });
};

const createLog = async (req: Request, res: Response) => {
  const { uuid, messages } = req.body;
  const logger = LogService.getLogger(uuid);

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    logger.info(message);

    if (message.includes('Initializing')) {
      await DeviceService.createDeviceStat(uuid.toString(), new Date(formatDate(new Date())));
    }
  }

  res.json({ status: 'ok' });
};

const deleteLog = (req: Request, res: Response) => {
  const { uuid, archive } = req.query;
  if (!uuid) {
    return res.json({
      status: 'error',
      error: 'No log file specified.',
    });
  }

  if (archive) {
    if (!LogService.deleteLogArchive(uuid.toString(), archive.toString())) {
      return res.json({
        status: 'error',
        error: `Failed to delete log archive.`,
      });
    }
    return res.json({ status: 'ok' });
  }

  const log = LogService.deleteLogs(uuid.toString());
  if (!log) {
    return res.json({
      status: 'error',
      error: `Failed to delete log.`,
    });
  }

  res.json({ status: 'ok' });
};

export const LogController = {
  getLogs,
  createLog,
  deleteLog,
};