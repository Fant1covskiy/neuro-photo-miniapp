import apiClient from './client';

export interface Order {
  id: number;
  telegram_user_id: string;
  username: string | null;
  first_name: string | null;
  styles: any[];
  photos: string[];
  total_price: number;
  status: string;
  payment_status: string;
  result_photos: string[] | null;
  tochka_qr_id: string | null;
  qr_code_url: string | null;
  created_at: string;
  updated_at: string;
}

export const ordersApi = {
  adminList: () => apiClient.get<Order[]>('/api/admin/orders'),
  myList: (telegramUserId: string) => apiClient.get<Order[]>(`/api/orders/user/${telegramUserId}`),
  getOne: (id: number) => apiClient.get<Order>(`/api/orders/${id}`),
};
