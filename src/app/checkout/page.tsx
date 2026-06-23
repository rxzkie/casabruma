"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CardPaymentForm from "@/components/CardPaymentForm";
import MobileNav from "@/components/MobileNav";
import { useCart } from "@/context/CartContext";
import { getSavedCheckout } from "@/lib/checkout";
import { formatCLP } from "@/lib/format";

export default function CheckoutPage() {
  const { items, total } = useCart();
  const router = useRouter();
  const checkout = getSavedCheckout();

  useEffect(() => {
    if (items.length === 0 || !checkout) {
      router.replace("/");
    }
  }, [items.length, checkout, router]);

  if (items.length === 0 || !checkout) return null;

  return (
    <>
      <main className="mx-auto max-w-lg px-4 py-8 pb-nav-safe md:pb-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-bruma-deep/60 transition hover:text-bruma-rose"
        >
          ← Volver
        </Link>

        <h1 className="font-display text-3xl text-bruma-deep">Pago</h1>
        <p className="mt-2 text-sm text-bruma-deep/55">
          Paga con tarjeta de crédito o débito. No necesitas cuenta de Mercado
          Pago.
        </p>

        <div className="mt-6 rounded-2xl border border-bruma-sand/80 bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-bruma-mist">
            Tu pedido
          </p>
          <ul className="mt-3 space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between text-sm text-bruma-deep"
              >
                <span className="line-clamp-1 pr-4">
                  {item.name} x{item.quantity}
                </span>
                <span className="shrink-0 text-bruma-rose">
                  {formatCLP(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-bruma-sand/50 pt-4">
            <span className="font-medium text-bruma-deep">Total</span>
            <span className="text-lg font-medium text-bruma-deep">
              {formatCLP(total)}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-bruma-sand/80 bg-white p-5">
          <p className="text-xs uppercase tracking-widest text-bruma-mist">
            Envío a
          </p>
          <p className="mt-2 text-sm text-bruma-deep">
            {checkout.shipping.street} {checkout.shipping.number}
            {checkout.shipping.apartment
              ? `, ${checkout.shipping.apartment}`
              : ""}
          </p>
          <p className="text-sm text-bruma-deep/60">
            {checkout.shipping.city}, {checkout.shipping.region}
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-bruma-sand/80 bg-white p-5">
          <p className="mb-4 text-xs uppercase tracking-widest text-bruma-mist">
            Datos de la tarjeta
          </p>
          <CardPaymentForm />
        </div>
      </main>
      <MobileNav />
    </>
  );
}
