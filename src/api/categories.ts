import apiClient from './client';

export interface Category {
  id: number;
  name: string;
  order: number;
  is_active: boolean;
}

export const categoriesApi = {
  getActive: () => apiClient.get<Category[]>('/categories/active'),
};
