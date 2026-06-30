"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { checkPayment, getOrderReference } from "@/lib/checkout";
import { formatCLP } from "@/lib/format";
import { getRejectionMessage } from "@/lib/mp-errors";
import type { OrderStatus, PaymentCheck } from "@/types/payment";

type Variant = "success" | "failure" | "pending";

const content: Record<
  Variant,
  { title: string; subtitle: string; icon: string }
> = {
  success: {
    title: "¡Pago exitoso!",
    subtitle: "Tu pedido fue procesado correctamente.",
    icon: "✓",
  },
  failure: {
    title: "Pago no completado",
    subtitle: "Hubo un problema al procesar tu pago. Intenta de nuevo.",
    icon: "✕",
  },
  pending: {
    title: "Pago pendiente",
    subtitle: "Tu pago está en proceso. Te avisaremos cuando se confirme.",
    icon: "…",
  },
};

function statusLabel(status: OrderStatus) {
  if (status === "COMPLETED") return "Completado";
  if (status === "PENDING") return "Pendiente";
  return "Fallido";
}

function variantFromStatus(status: OrderStatus): Variant {
  if (status === "COMPLETED") return "success";
  if (status === "PENDING") return "pending";
  return "failure";
}

function PaymentResultInner({ variant }: { variant: Variant }) {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || getOrderReference();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<PaymentCheck | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }
    checkPayment(ref).then((data) => {
      setOrder(data);
      if (data?.status === "COMPLETED") clearCart();
      setLoading(false);
    });
  }, [ref, clearCart]);

  const resolvedVariant = order ? variantFromStatus(order.status) : variant;
  const copy = content[resolvedVariant];

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div
        className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
          resolvedVariant === "success"
            ? "bg-green-100 text-green-600"
            : resolvedVariant === "failure"
              ? "bg-red-100 text-red-500"
              : "bg-amber-100 text-amber-600"
        }`}
      >
        {copy.icon}
      </div>
      <h1 className="font-display text-3xl text-bruma-deep">{copy.title}</h1>
      <p className="mt-3 text-sm text-bruma-deep/60">{copy.subtitle}</p>

      {loading && (
        <p className="mt-6 text-xs text-bruma-mist">Verificando pago...</p>
      )}

      {!loading && order && (
        <div className="mt-8 w-full rounded-2xl border border-bruma-sand/80 bg-white p-6 text-left">
          <p className="text-xs uppercase tracking-widest text-bruma-mist">
            Detalle del pedido
          </p>
          <p className="mt-2 text-sm text-bruma-deep">
            Orden: {order.externalReference}
          </p>
          {order.amount != null && (
            <p className="mt-1 text-sm text-bruma-deep">
              Monto: {formatCLP(order.amount)}
            </p>
          )}
          <p className="mt-1 text-sm text-bruma-deep/70">
            Estado: {statusLabel(order.status)}
          </p>
          {order.mpStatus && resolvedVariant === "failure" && (
            <p className="mt-2 text-sm text-red-600">
              {getRejectionMessage(order.mpStatus)}
            </p>
          )}
        </div>
      )}

      {!loading && !order && ref && (
        <p className="mt-6 text-xs text-bruma-mist">Referencia: {ref}</p>
      )}

      <Link
        href="/#catalogo"
        className="mt-8 rounded-full bg-bruma-deep px-8 py-3 text-sm tracking-wide text-bruma-cream"
      >
        Volver al catálogo
      </Link>
    </main>
  );
}

export default function PaymentResult({ variant }: { variant: Variant }) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-bruma-mist">Cargando...</p>
        </main>
      }
    >
      <PaymentResultInner variant={variant} />
    </Suspense>
  );
}
