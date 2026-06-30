import type { ApiProduct, ProductOptionGroup } from "@/types/product";

export function parseProductOptions(raw: unknown): ProductOptionGroup[] {
  if (!raw) return [];
  let data: unknown = raw;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(data)) return [];
  return data.filter(
    (group): group is ProductOptionGroup =>
      Boolean(group) &&
      typeof group === "object" &&
      typeof (group as ProductOptionGroup).id === "string" &&
      typeof (group as ProductOptionGroup).label === "string" &&
      Array.isArray((group as ProductOptionGroup).choices) &&
      (group as ProductOptionGroup).choices.length > 0,
  );
}

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
  const options = parseProductOptions(product.options);
  return {
    ...product,
    image_url,
    images,
    options: options.length ? options : product.options ?? null,
  };
}
