import { NextFunction, Request, Response } from 'express';

import { AuthService, logError, UserService } from '../services';

export const AdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  let token = req.headers['x-access-token']?.toString();
  //const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    // Allow API key to be passed in query string
    token = req.query['x-access-token']?.toString();
    if (!token) {
      return res.json({
        status: 'error',
        error: 'No token provided!',
      });
    }
  }

  const decoded = await AuthService.verifyAccessToken(token);
  if (!decoded) {
    return res.json({
      status: 'error',
      error: 'Unauthorized!',
    });
  }

  const nameOrId = decoded?.username ?? decoded?.id;
  const user = await UserService.getUserBy({ username: nameOrId });
  if (!user?.tokens?.accessToken) {
    return res.json({
      status: 'error',
      error: 'User does not have an access token!',
    });
  }

  if (user?.tokens?.accessToken !== token) {
    return res.json({
      status: 'error',
      error: 'Invalid access token!',
    });
  }

  try {
    // Check if user is root
    if (decoded?.root && !user?.root) {
      return res.json({
        status: 'error',
        error: 'User is not authorized!',
      });
    }

    (req as any).user = user;

    next();
  } catch (err) {
    logError(err);
    return res.json({
      status: 'error',
      error: 'Not authorized!',
    });
  }
};