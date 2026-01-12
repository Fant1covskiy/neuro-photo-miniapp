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
  
  export interface CartItem {
    styleId: number;
    styleName: string;
    stylePrice: number;
    styleImage: string;
    quantity: number;
  }
  
  export interface Category {
    id: number;
    name: string;
    order: number;
    is_active: boolean;
  }
  
  export interface Order {
    id: number;
    user_id: number;
    style_id: number;
    status: 'created' | 'paid' | 'processing' | 'done';
    total_price: number;
    created_at: string;
    style?: Style;
    files?: Array<{
      id: number;
      file_url: string;
      type: 'client' | 'result';
    }>;
  }
  