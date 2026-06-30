import type { ProductOptionGroup } from "@/types/product";

const STORE = "https://casabruma-phi.vercel.app";

export const PRODUCT_OPTIONS_FALLBACK: Record<string, ProductOptionGroup[]> = {
  "panty-gris-colegio-40-denier-escolar": [
    {
      id: "color",
      label: "Color",
      type: "color",
      choices: [
        {
          value: "gris",
          label: "Gris",
          image: `${STORE}/products/panty-gris-colegio-40-denier/1.webp`,
        },
      ],
    },
    {
      id: "size",
      label: "Talla",
      type: "button",
      choices: [
        { value: "l-xl", label: "L-XL" },
        { value: "s-m", label: "S-M" },
      ],
    },
  ],
};

export function getFallbackOptions(slug: string): ProductOptionGroup[] {
  return PRODUCT_OPTIONS_FALLBACK[slug] ?? [];
}
