import { Routes } from '../consts';
import { http } from '../modules';
import { setUserToken } from '../stores';

const register = async (username: string, password: string) => {
  const response = await http()
    .post('auth/register', {
      username,
      password,
    });
  return response.data;
};

const login = async (username: string, password: string) => {
  const response = await http()
    .post('auth/login', {
      username,
      password,
    });

  const data = response.data;
  const user = data?.user;
  if (user) {
    setUserToken(user);
  }
  return data;
};

const logout = () => {
  localStorage.clear();
  window.location.href = Routes.login;
};

export const AuthService = {
  register,
  login,
  logout,
};