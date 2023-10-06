import { Request, Response } from 'express';

import { AuthService } from '../services';

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const result = await AuthService.login(username, password);
  if (!result) {
    return res.json({
      status: 'error',
      error: `Failed to login.`,
    });
  }

  res.json({
    status: 'ok',
    user: result,
  });
};

const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const result = await AuthService.register(username, password);
  if (!result) {
    return res.json({
      status: 'error',
      error: `Failed to register user account.`,
    });
  }

  res.json({
    status: 'ok',
  });
};

export const AuthController = {
  login,
  register,
};