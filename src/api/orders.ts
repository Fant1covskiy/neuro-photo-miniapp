import { client } from './client';

export const getOrder = async (id: number) => {
  const { data } = await client.get(`/orders/${id}`);
  return data;
};

export const createOrder = async (data: any) => {
  const { data: response } = await client.post('/orders', data);
  return response;
};