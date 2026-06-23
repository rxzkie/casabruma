"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  createOrderReference,
  getMercadoPagoConfig,
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

export default function CardPaymentForm({
  checkout,
  onBack,
  onComplete,
}: CardPaymentFormProps) {
  const formId = useId().replace(/:/g, "");
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [sdkReady, setSdkReady] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cardFormRef = useRef<MercadoPagoCardForm | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    getMercadoPagoConfig().then((config) => {
      if (config?.public_key) setPublicKey(config.public_key);
    });
  }, []);

  useEffect(() => {
    if (!sdkReady || !publicKey || initialized.current || items.length === 0)
      return;

    const mp = new window.MercadoPago(publicKey, { locale: "es-CL" });

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
          placeholder: "RUT (12345678-9)",
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

            const result = await payWithCard({
              amount: total,
              token: data.token,
              payment_method_id: data.paymentMethodId,
              installments: Number(data.installments) || 1,
              issuer_id: data.issuerId ? Number(data.issuerId) : undefined,
              description,
              external_reference: ref,
              currency_id: "CLP",
              payer: {
                email: checkout.payer.email,
                name: checkout.payer.name,
                surname: checkout.payer.surname,
                identification_type: data.identificationType || "RUT",
                identification_number: data.identificationNumber,
              },
            });

            saveOrderReference(ref);
            onComplete?.();

            if (result.status === "approved") {
              clearCart();
              router.push(`/pago/exito?ref=${ref}`);
            } else if (result.status === "pending") {
              router.push(`/pago/pendiente?ref=${ref}`);
            } else {
              router.push(`/pago/error?ref=${ref}`);
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
    if (emailInput) emailInput.value = checkout.payer.email;

    const nameInput = document.getElementById(
      `${formId}__cardholderName`,
    ) as HTMLInputElement | null;
    if (nameInput) {
      nameInput.value =
        `${checkout.payer.name} ${checkout.payer.surname}`.trim();
    }

    initialized.current = true;
  }, [
    sdkReady,
    publicKey,
    total,
    items,
    checkout,
    formId,
    router,
    clearCart,
    onComplete,
  ]);

  return (
    <>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
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
            <label className="mb-1 block text-xs text-bruma-mist">RUT</label>
            <input
              id={`${formId}__identificationNumber`}
              type="text"
              placeholder="12345678-9"
              className={fieldClass}
            />
          </div>
        </div>
        <input
          id={`${formId}__cardholderEmail`}
          type="hidden"
          defaultValue={checkout.payer.email}
        />

        {error && <p className="text-center text-xs text-red-500">{error}</p>}

        {!publicKey && sdkReady && (
          <p className="text-center text-xs text-red-500">
            No se pudo cargar la configuración de pago
          </p>
        )}

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
            disabled={loading || !publicKey}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-bruma-deep text-sm tracking-wide text-bruma-cream transition active:bg-bruma-deep/85 disabled:opacity-60"
          >
            {loading ? "Procesando..." : `Pagar ${formatCLP(total)}`}
          </button>
        </div>
      </form>
    </>
  );
}
