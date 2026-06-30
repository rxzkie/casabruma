"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import CheckoutForm from "@/components/CheckoutForm";
import { formatCLP } from "@/lib/format";
import {
  calcDiscountAmount,
  calcDiscountedTotal,
  clearSavedDiscount,
  getSavedDiscount,
  saveDiscount,
  validateDiscountCode,
  type DiscountInfo,
} from "@/lib/discount";

export default function CartDrawer() {
  const {
    items,
    itemCount,
    total,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
  } = useCart();

  const [discount, setDiscount] = useState<DiscountInfo | null>(null);
  const [discountInput, setDiscountInput] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);

  useEffect(() => {
    const saved = getSavedDiscount();
    if (saved) {
      setDiscount(saved);
      setDiscountInput(saved.code);
    }
  }, []);

  const discountAmount = useMemo(
    () => (discount ? calcDiscountAmount(total, discount.percent) : 0),
    [discount, total],
  );

  const payableTotal = useMemo(
    () => (discount ? calcDiscountedTotal(total, discount.percent) : total),
    [discount, total],
  );

  async function handleApplyDiscount() {
    setDiscountError("");
    setDiscountLoading(true);
    try {
      const validated = await validateDiscountCode(discountInput);
      setDiscount(validated);
      saveDiscount(validated);
      setDiscountInput(validated.code);
    } catch (err) {
      setDiscount(null);
      clearSavedDiscount();
      setDiscountError(
        err instanceof Error ? err.message : "Codigo invalido",
      );
    } finally {
      setDiscountLoading(false);
    }
  }

  function handleRemoveDiscount() {
    setDiscount(null);
    setDiscountInput("");
    setDiscountError("");
    clearSavedDiscount();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        aria-label="Cerrar carrito"
        className="absolute inset-0 bg-bruma-deep/40 backdrop-blur-sm"
        onClick={closeCart}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bruma-cream shadow-2xl pt-safe">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-bruma-sand/60 px-4 sm:h-16">
          <h2 className="font-display text-xl text-bruma-deep">
            Carrito ({itemCount})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-bruma-deep transition active:bg-bruma-sand/50"
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-sm text-bruma-deep/50">Tu carrito está vacío</p>
            <Link
              href="/#catalogo"
              onClick={closeCart}
              className="rounded-full bg-bruma-deep px-6 py-3 text-sm tracking-wide text-bruma-cream"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <ul>
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-3 border-b border-bruma-sand/50 py-4 last:border-0"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-bruma-sand/30">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={`/producto/${item.slug}`}
                        onClick={closeCart}
                        className="line-clamp-2 text-sm font-medium text-bruma-deep"
                      >
                        {item.name}
                      </Link>
                      {item.variant ? (
                        <p className="mt-0.5 text-xs text-bruma-deep/50">
                          {item.variant}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm text-bruma-rose">
                        {formatCLP(item.price)}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-bruma-sand text-bruma-deep"
                            aria-label="Menos"
                          >
                            −
                          </button>
                          <span className="min-w-[1.5rem] text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-bruma-sand text-bruma-deep disabled:opacity-40"
                            aria-label="Más"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-bruma-deep/40 transition hover:text-bruma-rose"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-bruma-sand/60 pt-4">
                <p className="mb-2 text-xs uppercase tracking-widest text-bruma-mist">
                  Codigo de descuento
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountInput}
                    onChange={(e) =>
                      setDiscountInput(e.target.value.toUpperCase())
                    }
                    placeholder="BRUMA10"
                    className="w-full rounded-xl border border-bruma-sand bg-white px-3 py-2.5 text-sm text-bruma-deep outline-none transition focus:border-bruma-rose"
                  />
                  {discount ? (
                    <button
                      type="button"
                      onClick={handleRemoveDiscount}
                      className="shrink-0 rounded-xl border border-bruma-sand px-3 text-xs text-bruma-deep"
                    >
                      Quitar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyDiscount}
                      disabled={discountLoading || !discountInput.trim()}
                      className="shrink-0 rounded-xl bg-bruma-deep px-3 text-xs text-bruma-cream disabled:opacity-50"
                    >
                      {discountLoading ? "..." : "Aplicar"}
                    </button>
                  )}
                </div>
                {discount && (
                  <p className="mt-2 text-xs text-emerald-600">
                    {discount.code} aplicado ({discount.percent}% off)
                  </p>
                )}
                {discountError && (
                  <p className="mt-2 text-xs text-red-500">{discountError}</p>
                )}

                <div className="mb-4 mt-4 space-y-1">
                  <div className="flex items-center justify-between text-sm text-bruma-deep/60">
                    <span>Subtotal</span>
                    <span>{formatCLP(total)}</span>
                  </div>
                  {discount && discountAmount > 0 && (
                    <div className="flex items-center justify-between text-sm text-emerald-700">
                      <span>Descuento ({discount.code})</span>
                      <span>-{formatCLP(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-sm text-bruma-deep/60">Total</span>
                    <span className="text-xl font-medium text-bruma-deep">
                      {formatCLP(payableTotal)}
                    </span>
                  </div>
                </div>
                <CheckoutForm
                  onContinue={closeCart}
                  discountCode={discount?.code ?? null}
                  payableTotal={payableTotal}
                />
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
