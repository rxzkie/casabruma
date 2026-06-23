"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useMercadoPago } from "@/context/MercadoPagoContext";
import {
  buildCardPaymentBody,
  createOrderReference,
  isValidCardPublicKey,
  payWithCard,
  saveOrderReference,
} from "@/lib/checkout";
import { getRejectionMessage } from "@/lib/mp-errors";
import type { CheckoutData } from "@/types/payment";

const BRICK_CONTAINER = "bruma-card-payment-brick";

type PaymentBrickFormProps = {
  checkout: CheckoutData;
  onBack?: () => void;
  onComplete?: () => void;
};

type BrickFormData = {
  token?: string;
  payment_method_id?: string;
  installments?: number;
  issuer_id?: number;
  payer?: {
    email?: string;
    identification?: { type?: string; number?: string };
  };
};

function normalizeBrickPayload(
  payload: BrickFormData | { formData: BrickFormData },
): BrickFormData {
  if ("formData" in payload && payload.formData) {
    return payload.formData;
  }
  return payload as BrickFormData;
}

export default function PaymentBrickForm({
  checkout,
  onBack,
  onComplete,
}: PaymentBrickFormProps) {
  const { items, total, clearCart } = useCart();
  const { config, cardPublicKey, ready, loading: configLoading } =
    useMercadoPago();
  const router = useRouter();
  const [error, setError] = useState("");
  const [brickReady, setBrickReady] = useState(false);
  const controllerRef = useRef<{ unmount: () => void } | null>(null);
  const mountIdRef = useRef(0);
  const checkoutRef = useRef(checkout);
  const itemsRef = useRef(items);
  const onCompleteRef = useRef(onComplete);
  const testModeRef = useRef(false);

  checkoutRef.current = checkout;
  itemsRef.current = items;
  onCompleteRef.current = onComplete;
  testModeRef.current = Boolean(config?.sandbox || config?.test_mode);

  const invalidKey = !isValidCardPublicKey(cardPublicKey);
  const testCard = config?.test_card;

  useEffect(() => {
    if (!ready || invalidKey) return;

    const mountId = ++mountIdRef.current;
    setBrickReady(false);
    setError("");

    const timer = window.setTimeout(async () => {
      if (mountId !== mountIdRef.current) return;
      const container = document.getElementById(BRICK_CONTAINER);
      if (!container) return;

      container.innerHTML = "";
      controllerRef.current?.unmount();
      controllerRef.current = null;

      const mp = new window.MercadoPago(cardPublicKey, { locale: "es-CL" });
      const bricks = mp.bricks();

      try {
        const controller = await bricks.create("cardPayment", BRICK_CONTAINER, {
          initialization: {
            amount: total,
            payer: {
              email: checkoutRef.current.payer.email.trim(),
            },
          },
          customization: {
            visual: {
              style: {
                theme: "default",
              },
            },
          },
          callbacks: {
            onReady: () => {
              if (mountId !== mountIdRef.current) return;
              setBrickReady(true);
            },
            onSubmit: (
              payload: BrickFormData | { formData: BrickFormData },
            ) => {
              const currentCheckout = checkoutRef.current;
              const currentItems = itemsRef.current;
              const data = normalizeBrickPayload(payload);

              return new Promise<void>((resolve, reject) => {
                (async () => {
                  try {
                    if (!data.token || !data.payment_method_id) {
                      throw new Error(
                        "Completa los datos de la tarjeta para continuar.",
                      );
                    }

                    const ref = createOrderReference();
                    const description = currentItems
                      .map((i) => `${i.name} x${i.quantity}`)
                      .join(", ")
                      .slice(0, 200);

                    const body = buildCardPaymentBody(currentCheckout, {
                      amount: total,
                      token: data.token,
                      payment_method_id: data.payment_method_id,
                      installments: Number(data.installments) || 1,
                      issuer_id: data.issuer_id
                        ? Number(data.issuer_id)
                        : undefined,
                      description,
                      external_reference: ref,
                      testMode: testModeRef.current,
                      identification_type:
                        data.payer?.identification?.type || "Otro",
                      identification_number:
                        data.payer?.identification?.number || "123456789",
                      items: currentItems.map((item) => ({
                        id: item.id,
                        title: item.name,
                        quantity: item.quantity,
                        unit_price: item.price,
                      })),
                    });

                    const result = await payWithCard(body);
                    const orderRef = result.external_reference ?? ref;
                    saveOrderReference(orderRef);

                    if (result.status === "approved") {
                      onCompleteRef.current?.();
                      clearCart();
                      router.push(`/pago/exito?ref=${orderRef}`);
                      resolve();
                      return;
                    }

                    if (result.status === "pending") {
                      onCompleteRef.current?.();
                      router.push(`/pago/pendiente?ref=${orderRef}`);
                      resolve();
                      return;
                    }

                    reject(
                      new Error(getRejectionMessage(result.status_detail)),
                    );
                  } catch (err) {
                    reject(
                      err instanceof Error
                        ? err
                        : new Error("Error al procesar el pago"),
                    );
                  }
                })();
              });
            },
            onError: (err: { message?: string }) => {
              if (mountId !== mountIdRef.current) return;
              setBrickReady(false);
              setError(
                err.message ||
                  "No se pudo cargar el formulario de pago. Recarga la página.",
              );
            },
          },
        });

        if (mountId !== mountIdRef.current) {
          controller.unmount();
          return;
        }

        controllerRef.current = controller;
      } catch (err) {
        if (mountId === mountIdRef.current) {
          setBrickReady(false);
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el formulario de pago.",
          );
        }
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controllerRef.current?.unmount();
      controllerRef.current = null;
    };
  }, [ready, invalidKey, cardPublicKey, total, router, clearCart]);

  if (configLoading) {
    return (
      <p className="text-center text-xs text-bruma-mist">
        Cargando formulario de pago...
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {config?.sandbox && testCard && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <p className="font-medium">Modo prueba</p>
          <p className="mt-1">
            Tarjeta: {testCard.number} · CVV {testCard.cvv} · Vence{" "}
            {testCard.expiration} · Titular {testCard.holder_name}
          </p>
        </div>
      )}

      {invalidKey && (
        <p className="text-center text-xs text-red-500">
          No se pudo cargar public_key. Revisa GET /mercadopago/config.
        </p>
      )}

      <div id={BRICK_CONTAINER} className="min-h-[280px]" />

      {error && <p className="text-center text-xs text-red-500">{error}</p>}

      {!brickReady && ready && !invalidKey && (
        <p className="text-center text-xs text-bruma-mist">
          Preparando pago seguro...
        </p>
      )}

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-[44px] w-full items-center justify-center rounded-full border border-bruma-sand text-sm text-bruma-deep transition active:bg-bruma-sand/30"
        >
          Volver
        </button>
      )}
    </div>
  );
}
