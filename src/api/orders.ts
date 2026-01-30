import apiClient from './client';

export interface CreateOrderRequest {
  telegramUserId: string;
  username?: string;
  firstName?: string;
  styles?: any[];
  price: number;
}

export interface CreateOrderResponse {
  id: number;
  qrCodeUrl: string;
  qrId: string;
}

export const ordersApi = {
  create: (payload: CreateOrderRequest) => apiClient.post<CreateOrderResponse>('/api/orders', payload),
  getStatus: (orderId: number) => apiClient.get(`/api/orders/${orderId}/status`),
};
