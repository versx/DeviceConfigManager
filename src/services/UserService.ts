import { http } from '../modules';
import { User } from '../types';

const getUsers = async () => {
  const response = await http()
    .get('users');
  return response.data;
};

const createAccount = async (user: User) => {
  const response = await http()
    .post('users', user);
  return response.data;
};

const updateAccount = async (userId: number, user: User) => {
  const response = await http()
    .put(`users?userId=${userId}`, user);
  return response.data;
};

const resetApiKey = async (userId: number) => {
  const response = await http()
    .post(`users/${userId}/key/reset`);
  return response.data;
};

const changePassword = async (userId: number, oldPassword: string, newPassword: string) => {
  const response = await http()
    .post(`users/${userId}/password/reset`, { oldPassword, newPassword });
  return response.data;
};

const deleteAccount = async (userId: number) => {
  const response = await http()
    .delete(`users?userId=${userId}`);
  return response.data;
};

export const UserService = {
  getUsers,
  createAccount,
  updateAccount,
  resetApiKey,
  changePassword,
  deleteAccount,
};