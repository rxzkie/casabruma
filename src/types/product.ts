export type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: string;
  original_price?: string;
  discount_percentage?: number;
  stock: number;
  image_url: string;
  images: string[];
  tag?: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryItem = {
  category: string;
  count: number;
};

export type CategoriesResponse = {
  total: number;
  categories: CategoryItem[];
};
