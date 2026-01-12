import axios from 'axios';
import WebApp from '@twa-dev/sdk';

// Hardcoded API URL
const API_URL = 'https://neuro-photo-backend-production.up.railway.app';

console.log('🔥 API_URL:', API_URL);

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
