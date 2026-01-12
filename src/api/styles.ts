import apiClient from './client';

export interface Style {
  id: number;
  name: string;
  description: string;
  category_id: number;
  price: number;
  preview_image: string;
  tags: string[];
  is_active: boolean;
  created_at: string;
  category?: {
    id: number;
    name: string;
  };
  images?: Array<{
    id: number;
    url: string;
    is_preview: boolean;
    sort_order: number;
  }>;
}

export const stylesApi = {
  getAll: (categoryId?: number) => {
    const params = categoryId ? { category_id: categoryId } : {};
    return apiClient.get<Style[]>('/styles', { params });
  },
  
  search: (query: string) => 
    apiClient.get<Style[]>('/styles/search', { params: { q: query } }),
  
  getOne: (id: number) => 
    apiClient.get<Style>(`/styles/${id}`),
};
