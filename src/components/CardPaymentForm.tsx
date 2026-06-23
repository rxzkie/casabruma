"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  createOrderReference,
  getMercadoPagoConfig,
  getSavedCheckout,
  payWithCard,
  saveOrderReference,
} from "@/lib/checkout";
import { formatCLP } from "@/lib/format";

const fieldClass =
  "w-full rounded-xl border border-bruma-sand bg-white px-3 py-2.5 text-sm text-bruma-deep outline-none transition focus:border-bruma-rose";

const iframeClass = "h-10 w-full rounded-xl border border-bruma-sand bg-white";

export default function CardPaymentForm() {
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

    const checkout = getSavedCheckout();
    if (!checkout) {
      router.replace("/");
      return;
    }

    const mp = new window.MercadoPago(publicKey, { locale: "es-CL" });

    cardFormRef.current = mp.cardForm({
      amount: String(total),
      iframe: true,
      form: {
        id: "form-checkout",
        cardNumber: {
          id: "form-checkout__cardNumber",
          placeholder: "Número de tarjeta",
        },
        expirationDate: {
          id: "form-checkout__expirationDate",
          placeholder: "MM/AA",
        },
        securityCode: {
          id: "form-checkout__securityCode",
          placeholder: "CVV",
        },
        cardholderName: {
          id: "form-checkout__cardholderName",
          placeholder: "Nombre en la tarjeta",
        },
        issuer: {
          id: "form-checkout__issuer",
          placeholder: "Banco emisor",
        },
        installments: {
          id: "form-checkout__installments",
          placeholder: "Cuotas",
        },
        identificationType: {
          id: "form-checkout__identificationType",
          placeholder: "Tipo de documento",
        },
        identificationNumber: {
          id: "form-checkout__identificationNumber",
          placeholder: "RUT (12345678-9)",
        },
        cardholderEmail: {
          id: "form-checkout__cardholderEmail",
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

            if (result.status === "approved") {
              clearCart();
              router.push(`/pago-exitoso?ref=${ref}`);
            } else if (result.status === "pending") {
              router.push(`/pago-pendiente?ref=${ref}`);
            } else {
              router.push(`/pago-fallido?ref=${ref}`);
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
      "form-checkout__cardholderEmail",
    ) as HTMLInputElement | null;
    if (emailInput) emailInput.value = checkout.payer.email;

    const nameInput = document.getElementById(
      "form-checkout__cardholderName",
    ) as HTMLInputElement | null;
    if (nameInput)
      nameInput.value = `${checkout.payer.name} ${checkout.payer.surname}`.trim();

    initialized.current = true;
  }, [sdkReady, publicKey, total, items, router, clearCart]);

  return (
    <>
      <Script
        src="https://sdk.mercadopago.com/js/v2"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      <form id="form-checkout" className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">
            Número de tarjeta
          </label>
          <div id="form-checkout__cardNumber" className={iframeClass} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">
              Vencimiento
            </label>
            <div id="form-checkout__expirationDate" className={iframeClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">CVV</label>
            <div id="form-checkout__securityCode" className={iframeClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">
            Nombre en la tarjeta
          </label>
          <input
            id="form-checkout__cardholderName"
            type="text"
            className={fieldClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">Email</label>
          <input
            id="form-checkout__cardholderEmail"
            type="email"
            className={fieldClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">
              Tipo doc.
            </label>
            <select
              id="form-checkout__identificationType"
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">RUT</label>
            <input
              id="form-checkout__identificationNumber"
              type="text"
              placeholder="12345678-9"
              className={fieldClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">Banco</label>
            <select id="form-checkout__issuer" className={fieldClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">Cuotas</label>
            <select id="form-checkout__installments" className={fieldClass} />
          </div>
        </div>

        {error && <p className="text-center text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || !sdkReady || !publicKey}
          className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-bruma-deep text-sm tracking-wide text-bruma-cream transition active:bg-bruma-deep/85 disabled:opacity-60"
        >
          {loading
            ? "Procesando pago..."
            : !sdkReady || !publicKey
              ? "Cargando..."
              : `Pagar ${formatCLP(total)}`}
        </button>
      </form>
    </>
  );
}
