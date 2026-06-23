import type { ApiProduct } from "@/types/product";

export function getProductImageUrl(product: ApiProduct): string | null {
  const main = product.image_url?.trim();
  if (main) return main;
  const fromGallery = product.images?.find((img) => img?.trim());
  return fromGallery?.trim() ?? null;
}

export function getProductImages(product: ApiProduct): string[] {
  const gallery = (product.images ?? [])
    .map((img) => img?.trim())
    .filter((img): img is string => Boolean(img));
  const main = product.image_url?.trim();
  if (main && !gallery.includes(main)) return [main, ...gallery];
  if (gallery.length) return gallery;
  return main ? [main] : [];
}

export function normalizeProduct(product: ApiProduct): ApiProduct {
  const images = getProductImages(product);
  const image_url = getProductImageUrl(product) ?? images[0] ?? "";
  return { ...product, image_url, images };
}
