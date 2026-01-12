import axios from 'axios';
import WebApp from '@twa-dev/sdk';

// Hardcoded API URL - Version 2.0
const API_URL = 'https://neuro-photo-backend-production.up.railway.app';

console.log('🔥 API_URL:', API_URL);
console.log('🚀 Client version: 2.0');

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
