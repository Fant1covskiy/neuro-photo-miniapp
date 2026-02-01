import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const API_URL = 'https://neuro-photo-backend-production.up.railway.app';

export const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const initData = WebApp.initData;

  config.headers = config.headers || {};

  if (initData) {
    (config.headers as any)['x-telegram-init-data'] = initData;
  }

  const isFormData =
    typeof FormData !== 'undefined' &&
    config.data &&
    config.data instanceof FormData;

  if (isFormData) {
    if ((config.headers as any)['Content-Type']) {
      delete (config.headers as any)['Content-Type'];
    }
  } else {
    (config.headers as any)['Content-Type'] = 'application/json';
  }

  return config;
});

export default apiClient;
