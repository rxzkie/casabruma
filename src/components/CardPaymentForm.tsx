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
  const { config, cardPublicKey, ready, loading: configLoading } =
    useMercadoPago();
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
  const invalidKey = !isValidCardPublicKey(cardPublicKey);
  const payerEmail = checkout.payer.email.trim();
  const mpEmail = testCard
    ? config?.test_buyer_email ?? MP_TEST_BUYER_EMAIL
    : payerEmail;
  const cardholderName = testCard
    ? testCard.holder_name
    : `${checkout.payer.name} ${checkout.payer.surname}`.trim();

  const testCardRef = useRef(testCard);
  testCardRef.current = testCard;

  useEffect(() => {
    if (!ready || invalidKey) return;

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
          },
          onSubmit: async (event) => {
            event.preventDefault();
            setLoading(true);
            setError("");

            const currentCheckout = checkoutRef.current;
            const currentItems = itemsRef.current;
            const currentTestCard = testCardRef.current;

            try {
              const data = cardFormRef.current?.getCardFormData();
              if (!data?.token) {
                throw new Error(
                  "No se pudo tokenizar la tarjeta. Usa vencimiento 11/30, titular APRO y tipo doc. Otro.",
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
                testMode: Boolean(currentTestCard),
                identification_type: currentTestCard
                  ? "Otro"
                  : data.identificationType,
                identification_number: currentTestCard
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
  }, [ready, invalidKey, cardPublicKey, total, mpEmail, cardholderName, router, clearCart]);

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
          {testCard.holder_name} · doc. Otro / 123456789 · email{" "}
          {config?.test_buyer_email ?? MP_TEST_BUYER_EMAIL}
        </div>
      )}

      {invalidKey && (
        <p className="text-center text-xs text-red-500">
          No se pudo cargar la public_key de tarjetas. Revisa GET /mercadopago/config.
        </p>
      )}

      <form id={FORM_ID} className="space-y-3">
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
            readOnly={Boolean(testCard)}
            defaultValue={cardholderName}
            className={`${fieldClass}${testCard ? " bg-bruma-sand/20" : ""}`}
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
              readOnly={Boolean(testCard)}
              defaultValue={testCard?.identification_number ?? ""}
              placeholder="123456789"
              className={`${fieldClass}${testCard ? " bg-bruma-sand/20" : ""}`}
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
            disabled={loading || !ready || !formMounted || invalidKey}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-bruma-deep text-sm tracking-wide text-bruma-cream transition active:bg-bruma-deep/85 disabled:opacity-60"
          >
            {loading ? "Procesando..." : `Pagar ${formatCLP(total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
