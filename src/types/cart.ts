export type CartItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  variant?: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number;
};
