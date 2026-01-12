import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const initData = WebApp.initData;
  if (initData) {
    config.headers['x-telegram-init-data'] = initData;
  }
  return config;
});

export default apiClient;
