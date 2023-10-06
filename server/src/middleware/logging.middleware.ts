import { NextFunction, Request, Response } from 'express';

import { logDebug } from '../services';

export const LoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logDebug(`${req.method}: ${req.path}`);
  next();
};