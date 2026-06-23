"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useMercadoPago } from "@/context/MercadoPagoContext";
import {
  buildCardPaymentBody,
  createOrderReference,
  isValidCardPublicKey,
  payWithCard,
  saveOrderReference,
} from "@/lib/checkout";
import { formatCLP } from "@/lib/format";
import type { CheckoutData } from "@/types/payment";

const fieldClass =
  "w-full rounded-xl border border-bruma-sand bg-white px-3 py-2.5 text-sm text-bruma-deep outline-none transition focus:border-bruma-rose";

const iframeClass = "h-10 w-full rounded-xl border border-bruma-sand bg-white";

type CardPaymentFormProps = {
  checkout: CheckoutData;
  onBack?: () => void;
  onComplete?: () => void;
};

function formatCardNumber(number: string) {
  return number.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export default function CardPaymentForm({
  checkout,
  onBack,
  onComplete,
}: CardPaymentFormProps) {
  const formId = useId().replace(/:/g, "");
  const { items, total, clearCart } = useCart();
  const { config, cardPublicKey, ready, loading: configLoading } =
    useMercadoPago();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cardFormRef = useRef<MercadoPagoCardForm | null>(null);
  const initialized = useRef(false);

  const testCard = config?.test_card;
  const invalidKey = !isValidCardPublicKey(cardPublicKey);
  const payerEmail = checkout.payer.email.trim();
  const cardholderName = testCard
    ? testCard.holder_name
    : `${checkout.payer.name} ${checkout.payer.surname}`.trim();

  useEffect(() => {
    initialized.current = false;
    cardFormRef.current = null;
  }, [formId, cardPublicKey, total]);

  useEffect(() => {
    if (!ready || initialized.current || items.length === 0) return;

    const mp = new window.MercadoPago(cardPublicKey, { locale: "es-CL" });

    cardFormRef.current = mp.cardForm({
      amount: String(total),
      iframe: true,
      form: {
        id: formId,
        cardNumber: {
          id: `${formId}__cardNumber`,
          placeholder: "Número de tarjeta",
        },
        expirationDate: {
          id: `${formId}__expirationDate`,
          placeholder: "MM/AA",
        },
        securityCode: {
          id: `${formId}__securityCode`,
          placeholder: "CVV",
        },
        cardholderName: {
          id: `${formId}__cardholderName`,
          placeholder: "Nombre en la tarjeta",
        },
        issuer: {
          id: `${formId}__issuer`,
          placeholder: "Banco emisor",
        },
        installments: {
          id: `${formId}__installments`,
          placeholder: "Cuotas",
        },
        identificationType: {
          id: `${formId}__identificationType`,
          placeholder: "Tipo de documento",
        },
        identificationNumber: {
          id: `${formId}__identificationNumber`,
          placeholder: "Documento",
        },
        cardholderEmail: {
          id: `${formId}__cardholderEmail`,
          placeholder: "Email",
        },
      },
      callbacks: {
        onFormMounted: (err) => {
          if (err) setError("Error al cargar el formulario de pago");
        },
        onSubmit: async (event) => {
          event.preventDefault();
          setLoading(true);
          setError("");

          try {
            const data = cardFormRef.current?.getCardFormData();
            if (!data?.token) throw new Error("No se pudo procesar la tarjeta");

            const ref = createOrderReference();
            const description = items
              .map((i) => `${i.name} x${i.quantity}`)
              .join(", ")
              .slice(0, 200);

            const body = buildCardPaymentBody(checkout, {
              amount: total,
              token: data.token,
              payment_method_id: data.paymentMethodId,
              installments: Number(data.installments) || 1,
              issuer_id: data.issuerId ? Number(data.issuerId) : undefined,
              description,
              external_reference: ref,
              identification_type:
                data.identificationType || testCard?.identification_type,
              identification_number:
                data.identificationNumber || testCard?.identification_number,
            });

            const result = await payWithCard(body);
            const orderRef = result.external_reference ?? ref;
            saveOrderReference(orderRef);
            onComplete?.();

            if (result.status === "approved") {
              clearCart();
              router.push(`/pago/exito?ref=${orderRef}`);
            } else if (result.status === "pending") {
              router.push(`/pago/pendiente?ref=${orderRef}`);
            } else {
              router.push(`/pago/error?ref=${orderRef}`);
            }
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Error al procesar el pago",
            );
            setLoading(false);
          }
        },
      },
    });

    const emailInput = document.getElementById(
      `${formId}__cardholderEmail`,
    ) as HTMLInputElement | null;
    if (emailInput) emailInput.value = payerEmail;

    const nameInput = document.getElementById(
      `${formId}__cardholderName`,
    ) as HTMLInputElement | null;
    if (nameInput) nameInput.value = cardholderName;

    const idNumberInput = document.getElementById(
      `${formId}__identificationNumber`,
    ) as HTMLInputElement | null;
    if (idNumberInput && testCard?.identification_number) {
      idNumberInput.value = testCard.identification_number;
    }

    initialized.current = true;

    return () => {
      initialized.current = false;
      cardFormRef.current = null;
    };
  }, [
    ready,
    cardPublicKey,
    total,
    items,
    checkout,
    formId,
    router,
    clearCart,
    onComplete,
    payerEmail,
    cardholderName,
    testCard,
  ]);

  if (configLoading) {
    return (
      <p className="text-center text-xs text-bruma-mist">
        Cargando pasarela de pago...
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {testCard && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Tarjeta de prueba: {formatCardNumber(testCard.number)} · CVV{" "}
          {testCard.cvv} · vence {testCard.expiration} · titular{" "}
          {testCard.holder_name} · email distinto al de tu cuenta MP
        </div>
      )}

      {invalidKey && (
        <p className="text-center text-xs text-red-500">
          No se pudo cargar public_key APP_USR. Revisa GET /mercadopago/config en
          el backend.
        </p>
      )}

      <form id={formId} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">
            Número de tarjeta
          </label>
          <div id={`${formId}__cardNumber`} className={iframeClass} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">
              Vencimiento
            </label>
            <div id={`${formId}__expirationDate`} className={iframeClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">CVV</label>
            <div id={`${formId}__securityCode`} className={iframeClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">
            Nombre en la tarjeta
          </label>
          <input
            id={`${formId}__cardholderName`}
            type="text"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">
            Banco emisor
          </label>
          <select id={`${formId}__issuer`} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">Cuotas</label>
          <select id={`${formId}__installments`} className={fieldClass} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">
              Tipo de documento
            </label>
            <select
              id={`${formId}__identificationType`}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">
              Documento
            </label>
            <input
              id={`${formId}__identificationNumber`}
              type="text"
              placeholder="123456789"
              className={fieldClass}
            />
          </div>
        </div>
        <input
          id={`${formId}__cardholderEmail`}
          type="hidden"
          defaultValue={payerEmail}
        />

        {error && <p className="text-center text-xs text-red-500">{error}</p>}

        <div className="flex gap-2 pt-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-bruma-sand text-sm text-bruma-deep transition active:bg-bruma-sand/30 disabled:opacity-60"
            >
              Volver
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !ready}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-bruma-deep text-sm tracking-wide text-bruma-cream transition active:bg-bruma-deep/85 disabled:opacity-60"
          >
            {loading ? "Procesando..." : `Pagar ${formatCLP(total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
