import { compareSync } from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { sign, verify } from 'jsonwebtoken';

import config from '../config.json';
import { logError, UserService } from '.';
import { DefaultExpiresIn } from '../consts';
import { db } from '../models';
import { UserModel } from '../types';

const login = async (username: string, password: string) => {
  try {
    const user = await UserService.getUserBy({ username });
    if (!user) {
      return false;
    }

    if (!user.enabled) {
      return false;
    }

    const passwordIsValid = compareSync(password, user.password);
    if (!passwordIsValid) {
      return false;
    }

    const accessToken = generateAccessToken(user.username, user.root);
    const refreshToken = generateRefreshToken(user.username, user.root);
    await addRefreshToken(user.id!, accessToken, refreshToken);

    return {
      id: user.id,
      username: user.username,
      enabled: user.enabled,
      root: user.root,
      accessToken,
      refreshToken,
    };
  } catch (err) {
    logError(err);
    return false;
  }
};

const register = async (username: string, password: string) => {
  try {
    const user = await UserService.createUser({ username, password }, false);
    return !!user;
  } catch (err) {
    logError(err);
    return false;
  }
};

const refreshTokens = async (user: UserModel) => {
  if (!user?.tokens?.refreshToken) {
    return {
      status: 403,
      success: false,
      message: 'No token provided!',
    };
  }

  const dbToken = await getRefreshToken(user.id!);
  //console.log('dbToken:', dbToken);
  if (!dbToken?.refreshToken) {
    return {
      status: 403,
      success: false,
      message: 'Invalid refresh token!',
    };
  }

  let newAccessToken;
  let newRefreshToken;
  let error = false;
  try {
    const payload = verify(user.tokens?.refreshToken, config.auth.refreshTokenSecret);
    if (!payload) {
      return null;
    }
    newAccessToken = generateAccessToken(user.username, user.root);
    newRefreshToken = generateRefreshToken(user.username, user.root);

    // Save refresh tokens to database or some other storage persistence
    await addRefreshToken(user.id!, newAccessToken, newRefreshToken);
  } catch (err) {
    error = true;
    logError(err);
  }

  return {
    ...user,
    status: error ? 500 : 200,
    success: !error,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

const generateAccessToken = (username: string, isRoot: boolean = false): string => {
  const signOptions = { expiresIn: DefaultExpiresIn };
  const accessToken = sign({ username, root: isRoot }, config.auth.accessTokenSecret, signOptions);
  return accessToken;
};

const verifyAccessToken = (accessToken: string): Promise<any | false> => new Promise((resolve, reject) => {
  try {
    const decoded = verify(accessToken, config.auth.accessTokenSecret);
    // TODO: Check if decoded.exp expired
    resolve(decoded);
  } catch (err) {
    logError(err);
    resolve(false);
  }
});

const generateRefreshToken = (username: string, isRoot: boolean = false) => {
  const refreshToken = sign({ username, root: isRoot }, config.auth.refreshTokenSecret);
  return refreshToken
};

const getRefreshToken = async (userId: number) => {
  const entity = await db.refreshToken.findByPk(userId);
  return entity;
};

const addRefreshToken = async (userId: number, accessToken: string, refreshToken: string) => {
  const entity = await getRefreshToken(userId);
  if (!entity) {
    await db.refreshToken.create({
      userId: userId,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
    return;
  }

  if (entity.accessToken === accessToken && entity.refreshToken === refreshToken) {
    return;
  }

  entity.set({
    accessToken,
    refreshToken,
  });
  await entity.save();
};

const deleteRefreshToken = async (userId: number) => {
  const entity = await getRefreshToken(userId);
  if (entity) {
    entity.destroy();
  }
};

const createVerificationCode = () => {
  const verificationCode = randomBytes(32).toString('hex');
  const hashedVerificationCode = createHash('sha256')
    .update(verificationCode)
    .digest('hex');
  return { verificationCode, hashedVerificationCode };
};

export const AuthService = {
  login,
  register,
  refreshTokens,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  addRefreshToken,
  deleteRefreshToken,
  createVerificationCode,
};