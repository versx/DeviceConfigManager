import axios from 'axios';
import mem from 'mem';

import config from '../config.json';
import { Routes } from '../consts';
import { clearUserToken, getUserToken, setUserToken } from '../stores';

export const http = () => {
  const http = axios.create({
    baseURL: config.apiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  });

  http.interceptors.request.use(async (config: any) => {
    const user = getUserToken();
    if (user?.accessToken) {
      config.headers = {
        ...config.headers,
        //'Content-Type': 'application/json',
        'x-access-token': user?.accessToken,
      };
    }
    return config;
  }, (error) => Promise.reject(error));
  
  http.interceptors.response.use((response) => response, async (error) => {
    // JWT is invalid
    const originalRequest = error?.config;
  
    if (InvalidStatusCodes.includes(error?.response?.status ?? 401) &&
      !originalRequest?.sent) {
      originalRequest.sent = true;
  
      try {
        const newToken = await memoizedRefreshToken();
        if (newToken) {
          setUserToken(newToken);
        }
  
        if (newToken?.accessToken) {
          originalRequest.headers = {
            ...originalRequest.headers,
            //'Content-Type': 'application/json',
            'x-access-token': newToken?.accessToken,
          };
        }
      } catch (err: any) {
        console.error('http.interceptors.response.error:', err);
        //window.location.href = Routes.login;
      }
      return http(originalRequest);
    }
    return Promise.reject(error);
  });

  return http;
};

const redirectToLogin = () => {
  clearUserToken();
  window.location.href = Routes.login;
};

const refreshToken = async () => {
  try {
    const user: any = getUserToken();
    if (!user?.refreshToken) {
      redirectToLogin();
      return;
    }

    const response = await http().post('auth/refresh', { user });
    const session = response.data;
    //console.log('refreshToken response:', session);
    if (!session) {
      clearUserToken();
    } else {
      setUserToken(session);
    }
    return session;
  } catch (err) {
    console.error('error:', err);
    redirectToLogin();
  }
};

const memoizedRefreshToken = mem(refreshToken, { maxAge: 10000 });

const InvalidStatusCodes = [401, 403];