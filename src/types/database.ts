export interface Category {
  id: string;
  name: string;
  slug: string;
  sort: number;
}

export interface Product {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  active: boolean;
  category_id: string | null;
  whatsapp_message: string | null;
  // Joins
  category?: Category;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  sort: number;
}

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product?: Product;
}

export interface Testimonial {
  id: string;
  created_at: string;
  customer_name: string;
  rating: number;
  comment: string;
  active: boolean;
}
