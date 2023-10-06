import { Request, Response } from 'express';

import { UserService } from '../services';

const getUsers = async (req: Request, res: Response) => {
  const results = await UserService.getUsers();
  res.json({
    status: 'ok',
    users: results,
  });
};

const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserService.getUser(parseInt(id));
  if (!user) {
    return res.json({
      status: 'error',
      message: 'User not found',
    });
  }
  res.json({
    status: 'ok',
    user,
  });
};

const createUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const result = await UserService.createUser({
    username,
    password,
  });

  res.json({
    status: !result ? 'error' : 'ok',
    error: !result ? 'Failed to create user account.' : undefined,
    user: !result ? undefined : result,
  });
};

const updateUser = async (req: Request, res: Response) => {
  // TODO: Update user account
  res.json({
    status: 'ok',
  });
};

const deleteUser = async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) {
    return res.json({
      status: 'error',
      error: 'No user ID specified.',
    });
  }

  const user = await UserService.deleteUser(parseInt(userId.toString()));
  if (!user) {
    return res.json({
      status: 'error',
      error: `Failed to delete user account`,
    });
  }

  res.json({ status: 'ok' });
};

const changePassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.json({
      status: 'error',
      error: 'No user ID specified.',
    });
  }

  const { oldPassword, newPassword } = req.body;
  const result = await UserService.changePassword(parseInt(id), oldPassword, newPassword);
  if (!result) {
    return res.json({
      status: 'error',
      error: 'Failed to change user account password',
    });
  }

  res.json({ status: 'ok' });
};

const resetApiKey = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.json({
      status: 'error',
      error: 'No user ID specified.',
    });
  }

  const result = await UserService.resetApiKey(parseInt(id));
  if (!result) {
    return res.json({
      status: 'error',
      error: `Failed to reset API key.`,
    });
  }

  res.json({ status: 'ok', apiKey: result });
};

export const UserController = {
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  changePassword,
  resetApiKey,
};