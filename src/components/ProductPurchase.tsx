"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { getProductImageUrl } from "@/lib/product";
import type { ApiProduct, ProductOptionGroup } from "@/types/product";

type ProductPurchaseProps = {
  product: ApiProduct;
};

function defaultSelections(groups: ProductOptionGroup[]) {
  return Object.fromEntries(
    groups.map((group) => [group.id, group.choices[0]?.value ?? ""]),
  );
}

function formatVariant(
  groups: ProductOptionGroup[],
  selected: Record<string, string>,
) {
  return groups
    .map((group) => {
      const choice = group.choices.find((c) => c.value === selected[group.id]);
      return choice ? `${group.label}: ${choice.label}` : "";
    })
    .filter(Boolean)
    .join(" · ");
}

export default function ProductPurchase({ product }: ProductPurchaseProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const groups = product.options ?? [];
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    groups.length ? defaultSelections(groups) : {},
  );

  const variantLabel = useMemo(
    () => (groups.length ? formatVariant(groups, selected) : undefined),
    [groups, selected],
  );

  const optionsComplete =
    !groups.length ||
    groups.every((group) => Boolean(selected[group.id]?.trim()));

  function handleAdd() {
    if (!optionsComplete) return;
    const image = getProductImageUrl(product);
    const lineId = variantLabel
      ? `${product.id}__${groups.map((g) => selected[g.id]).join("__")}`
      : product.id;

    addItem({
      id: lineId,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      variant: variantLabel,
      price: parseInt(product.price, 10),
      image_url: image ?? "",
      quantity: 1,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <>
      {groups.map((group) => (
        <div key={group.id} className="mt-5">
          <p className="text-sm text-bruma-deep/70">
            {group.label}:{" "}
            <span className="font-medium text-bruma-deep">
              {
                group.choices.find((choice) => choice.value === selected[group.id])
                  ?.label
              }
            </span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.choices.map((choice) => {
              const active = selected[group.id] === choice.value;
              if (group.type === "color" && choice.image) {
                return (
                  <button
                    key={choice.value}
                    type="button"
                    onClick={() =>
                      setSelected((prev) => ({
                        ...prev,
                        [group.id]: choice.value,
                      }))
                    }
                    className={`overflow-hidden rounded-lg border-2 transition ${
                      active
                        ? "border-bruma-rose ring-2 ring-bruma-rose/30"
                        : "border-bruma-sand"
                    }`}
                    aria-label={choice.label}
                  >
                    <img
                      src={choice.image}
                      alt={choice.label}
                      className="h-14 w-14 object-cover"
                    />
                  </button>
                );
              }
              return (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() =>
                    setSelected((prev) => ({
                      ...prev,
                      [group.id]: choice.value,
                    }))
                  }
                  className={`min-h-[40px] rounded-lg border px-4 text-sm transition ${
                    active
                      ? "border-bruma-deep bg-bruma-deep text-bruma-cream"
                      : "border-bruma-sand bg-white text-bruma-deep hover:border-bruma-deep/30"
                  }`}
                >
                  {choice.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {product.stock === 0 ? (
        <div className="mt-6 flex min-h-[48px] items-center justify-center rounded-full bg-bruma-sand/50 text-sm tracking-wide text-bruma-deep/50">
          Producto agotado
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleAdd}
            disabled={!optionsComplete}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-bruma-deep text-sm tracking-wide text-bruma-cream transition active:bg-bruma-deep/85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {added ? "Agregado ✓" : "Agregar al carrito"}
          </button>
          <Link
            href={`https://wa.me/56900000000?text=${encodeURIComponent(
              `Hola! Quiero pedir: ${product.name}${variantLabel ? ` (${variantLabel})` : ""}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-bruma-deep/20 text-sm tracking-wide text-bruma-deep transition active:border-bruma-rose active:text-bruma-rose"
          >
            Pedir por WhatsApp
          </Link>
        </div>
      )}
    </>
  );
}
