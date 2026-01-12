import apiClient from './client';

export interface Order {
  id: number;
  user_id: number;
  style_id: number;
  status: 'created' | 'paid' | 'processing' | 'done';
  total_price: number;
  created_at: string;
  style?: any;
  files?: Array<{
    id: number;
    file_url: string;
    type: 'client' | 'result';
  }>;
}

export const ordersApi = {
  create: (styleId: number) => 
    apiClient.post<Order>('/orders', { style_id: styleId }),
  
  getMy: () => 
    apiClient.get<Order[]>('/orders'),
  
  getOne: (id: number) => 
    apiClient.get<Order>(`/orders/${id}`),
  
  uploadFiles: (orderId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    return apiClient.post(`/orders/${orderId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
