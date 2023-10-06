import axios from 'axios';

import config from '../config.json';
import { getUserToken } from '../stores';

export const http = () => {
  const currentUser = getUserToken();
  const http = axios.create({
    baseURL: config.apiUrl,
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': currentUser?.apiKey,
    },
    withCredentials: true,
  });
  return http;
};