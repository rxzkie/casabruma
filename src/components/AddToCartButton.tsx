"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { getProductImageUrl } from "@/lib/product";
import type { ApiProduct } from "@/types/product";

type AddToCartButtonProps = {
  product: ApiProduct;
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    const image = getProductImageUrl(product);
    addItem({
      id: product.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: parseInt(product.price, 10),
      image_url: image ?? "",
      quantity: 1,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className="flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-bruma-deep text-sm tracking-wide text-bruma-cream transition active:bg-bruma-deep/85"
    >
      {added ? "Agregado ✓" : "Agregar al carrito"}
    </button>
  );
}
