"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { formatCLP } from "@/lib/format";
import { MP_TEST_BUYER_EMAIL } from "@/types/payment";
import type { CheckoutData, MercadoPagoTestCard } from "@/types/payment";

const FORM_ID = "bruma-card-payment";

const fieldClass =
  "w-full rounded-xl border border-bruma-sand bg-white px-3 py-2.5 text-sm text-bruma-deep outline-none transition focus:border-bruma-rose";

const iframeClass = "h-11 w-full rounded-xl border border-bruma-sand bg-white";

type CardPaymentFormProps = {
  checkout: CheckoutData;
  onBack?: () => void;
  onComplete?: () => void;
};

function formatCardNumber(number: string) {
  return number.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function normalizeTestCard(testCard?: MercadoPagoTestCard) {
  if (!testCard) return null;
  const expiration =
    testCard.expiration === "11/25" ? "11/30" : testCard.expiration;
  return { ...testCard, expiration };
}

export default function CardPaymentForm({
  checkout,
  onBack,
  onComplete,
}: CardPaymentFormProps) {
  const { items, total, clearCart } = useCart();
  const {
    config,
    cardPublicKey,
    ready,
    loading: configLoading,
    refreshConfig,
  } = useMercadoPago();
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formMounted, setFormMounted] = useState(false);
  const cardFormRef = useRef<MercadoPagoCardForm | null>(null);
  const mountIdRef = useRef(0);
  const checkoutRef = useRef(checkout);
  const itemsRef = useRef(items);
  const onCompleteRef = useRef(onComplete);

  checkoutRef.current = checkout;
  itemsRef.current = items;
  onCompleteRef.current = onComplete;

  const testCard = useMemo(
    () => normalizeTestCard(config?.test_card),
    [config?.test_card],
  );
  const isTestMode = Boolean(config?.sandbox || config?.test_mode || testCard);
  const invalidKey = !isValidCardPublicKey(cardPublicKey, config?.sandbox);
  const credentialsOk = config?.credentials_ok !== false;
  const payerEmail = checkout.payer.email.trim();
  const mpEmail = isTestMode ? MP_TEST_BUYER_EMAIL : payerEmail;
  const cardholderName = isTestMode
    ? testCard?.holder_name ?? "APRO"
    : `${checkout.payer.name} ${checkout.payer.surname}`.trim();

  const testCardRef = useRef(testCard);
  const isTestModeRef = useRef(isTestMode);
  testCardRef.current = testCard;
  isTestModeRef.current = isTestMode;

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  useEffect(() => {
    if (!ready || invalidKey || !credentialsOk) return;

    const mountId = ++mountIdRef.current;
    const email = mpEmail;
    const holder = cardholderName;
    setFormMounted(false);
    setError("");

    const timer = window.setTimeout(() => {
      if (mountId !== mountIdRef.current) return;
      if (!document.getElementById(FORM_ID)) return;

      const mp = new window.MercadoPago(cardPublicKey, { locale: "es-CL" });

      cardFormRef.current = mp.cardForm({
        amount: String(total),
        iframe: true,
        form: {
          id: FORM_ID,
          cardNumber: {
            id: `${FORM_ID}__cardNumber`,
            placeholder: "Número de tarjeta",
          },
          expirationDate: {
            id: `${FORM_ID}__expirationDate`,
            placeholder: "MM/AA",
          },
          securityCode: {
            id: `${FORM_ID}__securityCode`,
            placeholder: "CVV",
          },
          cardholderName: {
            id: `${FORM_ID}__cardholderName`,
            placeholder: "Nombre en la tarjeta",
          },
          issuer: {
            id: `${FORM_ID}__issuer`,
            placeholder: "Banco emisor",
          },
          installments: {
            id: `${FORM_ID}__installments`,
            placeholder: "Cuotas",
          },
          identificationType: {
            id: `${FORM_ID}__identificationType`,
            placeholder: "Tipo de documento",
          },
          identificationNumber: {
            id: `${FORM_ID}__identificationNumber`,
            placeholder: "Documento",
          },
          cardholderEmail: {
            id: `${FORM_ID}__cardholderEmail`,
            placeholder: "Email",
          },
        },
        callbacks: {
          onFormMounted: (err) => {
            if (mountId !== mountIdRef.current) return;
            if (err) {
              setFormMounted(false);
              setError("Error al cargar el formulario de pago");
              return;
            }
            setFormMounted(true);

            const emailInput = document.getElementById(
              `${FORM_ID}__cardholderEmail`,
            ) as HTMLInputElement | null;
            if (emailInput) emailInput.value = email;

            const nameInput = document.getElementById(
              `${FORM_ID}__cardholderName`,
            ) as HTMLInputElement | null;
            if (nameInput) nameInput.value = holder;

            const idNumberInput = document.getElementById(
              `${FORM_ID}__identificationNumber`,
            ) as HTMLInputElement | null;
            if (idNumberInput && testCardRef.current?.identification_number) {
              idNumberInput.value = testCardRef.current.identification_number;
            }

            const idTypeSelect = document.getElementById(
              `${FORM_ID}__identificationType`,
            ) as HTMLSelectElement | null;
            if (
              idTypeSelect &&
              (testCardRef.current?.identification_type || isTestModeRef.current)
            ) {
              const target =
                testCardRef.current?.identification_type || "Otro";
              for (const option of Array.from(idTypeSelect.options)) {
                if (option.value === target || option.text === target) {
                  idTypeSelect.value = option.value;
                  break;
                }
              }
            }
          },
          onSubmit: async (event) => {
            event.preventDefault();
            setLoading(true);
            setError("");

            const currentCheckout = checkoutRef.current;
            const currentItems = itemsRef.current;
            const useTestMode = isTestModeRef.current;

            try {
              await new Promise((resolve) => window.setTimeout(resolve, 0));
              const data = cardFormRef.current?.getCardFormData();
              if (!data?.token || data.token.length < 20) {
                throw new Error(
                  "No se pudo tokenizar la tarjeta. Recarga con Ctrl+Shift+R, usa vencimiento 11/30, titular APRO y doc. Otro.",
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
                payment_method_id: data.paymentMethodId,
                installments: Number(data.installments) || 1,
                issuer_id: data.issuerId ? Number(data.issuerId) : undefined,
                description,
                external_reference: ref,
                testMode: useTestMode,
                identification_type: useTestMode
                  ? "Otro"
                  : data.identificationType,
                identification_number: useTestMode
                  ? "123456789"
                  : data.identificationNumber,
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
              } else if (result.status === "pending") {
                onCompleteRef.current?.();
                router.push(`/pago/pendiente?ref=${orderRef}`);
              } else {
                setError(getRejectionMessage(result.status_detail));
                setLoading(false);
              }
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Error al procesar el pago",
              );
              setLoading(false);
            }
          },
        },
      });
    }, 200);

    return () => {
      window.clearTimeout(timer);
      cardFormRef.current = null;
    };
  }, [
    ready,
    invalidKey,
    cardPublicKey,
    total,
    mpEmail,
    cardholderName,
    router,
    clearCart,
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
      {isTestMode && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Modo prueba · Tarjeta:{" "}
          {formatCardNumber(testCard?.number ?? "4168818844447115")} · CVV{" "}
          {testCard?.cvv ?? "123"} · vence {testCard?.expiration ?? "11/30"} ·
          titular APRO · doc. Otro / 123456789 · email {MP_TEST_BUYER_EMAIL}
        </div>
      )}

      {!credentialsOk && (
        <p className="text-center text-xs text-red-500">
          Credenciales MP mal configuradas en Render. Copia MP_PUBLIC_KEY y
          MP_ACCESS_TOKEN del mismo panel. Con MP_SANDBOX=true agrega
          MP_TEST_PUBLIC_KEY y MP_TEST_ACCESS_TOKEN.
        </p>
      )}

      {invalidKey && (
        <p className="text-center text-xs text-red-500">
          No se pudo cargar public_key APP_USR. Revisa GET /mercadopago/config.
        </p>
      )}

      <form id={FORM_ID} key={cardPublicKey} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">
            Número de tarjeta
          </label>
          <div id={`${FORM_ID}__cardNumber`} className={iframeClass} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">
              Vencimiento
            </label>
            <div id={`${FORM_ID}__expirationDate`} className={iframeClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">CVV</label>
            <div id={`${FORM_ID}__securityCode`} className={iframeClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">
            Nombre en la tarjeta
          </label>
          <input
            id={`${FORM_ID}__cardholderName`}
            type="text"
            readOnly={isTestMode}
            defaultValue={cardholderName}
            className={`${fieldClass}${isTestMode ? " bg-bruma-sand/20" : ""}`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">Email</label>
          <input
            id={`${FORM_ID}__cardholderEmail`}
            type="email"
            readOnly
            defaultValue={mpEmail}
            className={`${fieldClass} bg-bruma-sand/20`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">
            Banco emisor
          </label>
          <select id={`${FORM_ID}__issuer`} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">Cuotas</label>
          <select id={`${FORM_ID}__installments`} className={fieldClass} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">
              Tipo de documento
            </label>
            <select
              id={`${FORM_ID}__identificationType`}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-bruma-mist">
              Documento
            </label>
            <input
              id={`${FORM_ID}__identificationNumber`}
              type="text"
              readOnly={isTestMode}
              defaultValue={testCard?.identification_number ?? "123456789"}
              placeholder="123456789"
              className={`${fieldClass}${isTestMode ? " bg-bruma-sand/20" : ""}`}
            />
          </div>
        </div>

        {error && <p className="text-center text-xs text-red-500">{error}</p>}

        {!formMounted && ready && !invalidKey && (
          <p className="text-center text-xs text-bruma-mist">
            Preparando formulario seguro...
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
            disabled={loading || !ready || !formMounted || invalidKey || !credentialsOk}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-bruma-deep text-sm tracking-wide text-bruma-cream transition active:bg-bruma-deep/85 disabled:opacity-60"
          >
            {loading ? "Procesando..." : `Pagar ${formatCLP(total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
