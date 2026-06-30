import { API_URL } from "@/lib/config";
import { normalizeProduct } from "@/lib/product";
import type { ApiProduct, CategoriesResponse } from "@/types/product";

export async function getProducts(params?: {
  category?: string;
  tag?: string;
  search?: string;
}): Promise<ApiProduct[]> {
  const url = new URL(`${API_URL}/products`);
  if (params?.category) url.searchParams.set("category", params.category);
  if (params?.tag) url.searchParams.set("tag", params.tag);
  if (params?.search) url.searchParams.set("search", params.search);

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!res.ok) return [];

  const data: ApiProduct[] = await res.json();
  return data.filter((p) => p.is_active).map(normalizeProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<ApiProduct | null> {
  const res = await fetch(`${API_URL}/products/slug/${slug}`, {
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) return null;

  const product: ApiProduct = await res.json();
  return normalizeProduct(product);
}

export async function getProductById(id: string): Promise<ApiProduct | null> {
  const res = await fetch(`${API_URL}/products/${id}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;
  if (!res.ok) return null;

  const product: ApiProduct = await res.json();
  return normalizeProduct(product);
}

export async function getCategories(): Promise<CategoriesResponse> {
  const res = await fetch(`${API_URL}/products/categories`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return { total: 0, categories: [] };
  }

  return res.json();
}
