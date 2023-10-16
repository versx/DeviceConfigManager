import { compareSync, hashSync } from 'bcryptjs';

import { logError, logWarn } from '.';
import {
  DefaultUserPasswordIterations,
  UserAttributes,
} from '../consts';
import { db } from '../models';
import { UserModel } from '../types';

const isFreshInstall = async (): Promise<boolean> => {
  const users = await getUsers();
  return users.length === 0;
};

const getUsers = async (): Promise<UserModel[]> => {
  const results = await db.user.findAll({
    attributes: UserAttributes,
  });
  return results;
};

const getUser = async (id: number) => {
  const result = await db.user.findByPk(id, {
    attributes: UserAttributes,
  });
  return result;
};

const getUserBy = async (where: any): Promise<UserModel> => {
  const result = await db.user.findOne({
    where,
    attributes: UserAttributes,
    include: [{
      as: 'tokens',
      model: db.refreshToken,
    }],
  });
  return result;
};

const createUser = async (user: UserModel, isRoot: boolean = false): Promise<UserModel | false> => {
  // Check if user with username already exists
  if (await getUserBy({ username: user.username })) {
    return false;
  }

  const password = hashSync(user.password, DefaultUserPasswordIterations);

  // Create new user account
  const result = await db.user.create({
    username: user.username,
    password,
    enabled: true,
    root: isRoot,
  });
  return result;
};

const deleteUser = async (userId: number) => {
  try {
    const user = await getUser(userId);
    if (user) {
      await user?.destroy();
    }
    return true;
  } catch (err) {
    logError(err);
    return false;
  }
};

const changePassword = async (userId: number, oldPassword: string, newPassword: string) => {
  try {
    const user = await db.user.findByPk(userId);
    if (!user) {
      return false;
    }

    if (!compareSync(oldPassword, user.password)) {
      logWarn('Old password does not match');
      return false;
    }

    const newPasswordHash = hashSync(newPassword, DefaultUserPasswordIterations);
    user.set({
      password: newPasswordHash,
    });

    await user.save();
    return true;
  } catch (err) {
    logError(err);
    return false;
  }
};

const isValidPassword = (password: string, hashedPassword: string) => {
  const passwordIsValid = compareSync(password, hashedPassword);
  return passwordIsValid;
};

export const UserService = {
  isFreshInstall,
  getUsers,
  getUser,
  getUserBy,
  createUser,
  deleteUser,
  changePassword,
  isValidPassword,
};