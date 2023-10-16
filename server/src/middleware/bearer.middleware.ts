import { NextFunction, Request, Response } from 'express';

import { AppConfig } from '../types';
const config: AppConfig = require('../config.json');

export const BearerTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const tokens = config.auth?.bearerTokens || [];
  const authHeader = req.headers.authorization;

  if (!authHeader && tokens.length > 0) {
    return res.json({
      status: 'error',
      error: 'Not Authorized!',
    });
  }

  const bearer = authHeader!.split(' ')[1] || '';
  if (tokens.length > 0 && !tokens.includes(bearer.toLowerCase())) {
    return res.json({
      status: 'error',
      error: 'Not Authorized!',
    });
  }

  next();
};