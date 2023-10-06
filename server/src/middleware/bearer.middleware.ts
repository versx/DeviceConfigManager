import { NextFunction, Request, Response } from 'express';

const config = require('../config.json');

export const BearerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json({
      status: 'error',
      error: 'Not Authorized!',
    });
  }

  const bearer = authHeader.split(' ')[1] || '';
  if (config.tokens.length > 0 && !config.tokens.includes(bearer.toLowerCase())) {
    return res.json({
      status: 'error',
      error: 'Not Authorized!',
    });
  }

  next();
};