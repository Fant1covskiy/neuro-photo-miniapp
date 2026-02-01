import axios from 'axios';

export const client = axios.create({
  baseURL: 'https://neuro-photo-backend-production.up.railway.app',
});

export default client;