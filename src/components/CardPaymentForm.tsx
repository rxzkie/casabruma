"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  buildCardPaymentBody,
  createOrderReference,
  getMercadoPagoConfig,
  payWithCard,
  resolvePayerEmail,
  saveOrderReference,
} from "@/lib/checkout";
import {
  createMercadoPagoInstance,
  loadMercadoPagoSdk,
} from "@/lib/mercadopago-sdk";
import { getRejectionMessage } from "@/lib/mp-errors";
import { formatCLP } from "@/lib/format";
import type { CheckoutData, MercadoPagoConfig, MercadoPagoTestCard } from "@/types/payment";

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

function buildFormId(publicKey: string) {
  const suffix = publicKey.replace(/[^a-zA-Z0-9]/g, "").slice(-10);
  return `bruma-mp-${suffix || "pay"}`;
}

export default function CardPaymentForm({
  checkout,
  onBack,
  onComplete,
}: CardPaymentFormProps) {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [config, setConfig] = useState<MercadoPagoConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [formMounted, setFormMounted] = useState(false);
  const cardFormRef = useRef<MercadoPagoCardForm | null>(null);
  const publicKeyRef = useRef("");
  const mountIdRef = useRef(0);
  const checkoutRef = useRef(checkout);
  const itemsRef = useRef(items);
  const onCompleteRef = useRef(onComplete);
  const configRef = useRef<MercadoPagoConfig | null>(null);

  checkoutRef.current = checkout;
  itemsRef.current = items;
  onCompleteRef.current = onComplete;
  configRef.current = config;

  const testCard = useMemo(
    () => normalizeTestCard(config?.test_card),
    [config?.test_card],
  );
  const isTestMode = Boolean(config?.sandbox || config?.test_mode || testCard);
  const mpEmail = resolvePayerEmail(checkout, isTestMode, config);
  const cardholderName = isTestMode
    ? testCard?.holder_name ?? "APRO"
    : `${checkout.payer.name} ${checkout.payer.surname}`.trim();
  const formId = config?.public_key ? buildFormId(config.public_key) : "";
  const credentialsOk = config?.credentials_ok === true;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setConfigLoading(true);
      setConfigError("");
      try {
        const nextConfig = await getMercadoPagoConfig();
        if (cancelled) return;

        if (!nextConfig?.public_key?.startsWith("APP_USR-")) {
          throw new Error("public_key APP_USR inválida en /mercadopago/config");
        }

        if (nextConfig.credentials_ok !== true) {
          throw new Error(
            "Credenciales MP mal configuradas en Render (MP_PUBLIC_KEY + MP_ACCESS_TOKEN).",
          );
        }

        publicKeyRef.current = nextConfig.public_key.trim();
        setConfig(nextConfig);
      } catch (err) {
        if (!cancelled) {
          setConfigError(
            err instanceof Error ? err.message : "Error al cargar config MP",
          );
        }
      } finally {
        if (!cancelled) setConfigLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!config?.public_key || !credentialsOk || !formId) return;

    let cancelled = false;
    const mountId = ++mountIdRef.current;

    setFormMounted(false);
    setError("");
    cardFormRef.current = null;

    (async () => {
      try {
        await loadMercadoPagoSdk(config.sdk_url);
        if (cancelled || mountId !== mountIdRef.current) return;

        await new Promise((resolve) => window.setTimeout(resolve, 50));
        if (cancelled || mountId !== mountIdRef.current) return;

        const activeFormId = buildFormId(publicKeyRef.current);
        if (!document.getElementById(activeFormId)) {
          throw new Error("Formulario de pago no disponible");
        }

        const mp = createMercadoPagoInstance(publicKeyRef.current);
        const currentConfig = configRef.current;
        const useTestMode = Boolean(
          currentConfig?.sandbox ||
            currentConfig?.test_mode ||
            currentConfig?.test_card,
        );
        const email = resolvePayerEmail(
          checkoutRef.current,
          useTestMode,
          currentConfig,
        );
        const holder = useTestMode
          ? currentConfig?.test_card?.holder_name ?? "APRO"
          : `${checkoutRef.current.payer.name} ${checkoutRef.current.payer.surname}`.trim();

        cardFormRef.current = mp.cardForm({
          amount: String(total),
          iframe: true,
          form: {
            id: activeFormId,
            cardNumber: {
              id: `${activeFormId}__cardNumber`,
              placeholder: "Número de tarjeta",
            },
            expirationDate: {
              id: `${activeFormId}__expirationDate`,
              placeholder: "MM/AA",
            },
            securityCode: {
              id: `${activeFormId}__securityCode`,
              placeholder: "CVV",
            },
            cardholderName: {
              id: `${activeFormId}__cardholderName`,
              placeholder: "Nombre en la tarjeta",
            },
            issuer: {
              id: `${activeFormId}__issuer`,
              placeholder: "Banco emisor",
            },
            installments: {
              id: `${activeFormId}__installments`,
              placeholder: "Cuotas",
            },
            identificationType: {
              id: `${activeFormId}__identificationType`,
              placeholder: "Tipo de documento",
            },
            identificationNumber: {
              id: `${activeFormId}__identificationNumber`,
              placeholder: "Documento",
            },
            cardholderEmail: {
              id: `${activeFormId}__cardholderEmail`,
              placeholder: "Email",
            },
          },
          callbacks: {
            onFormMounted: (err) => {
              if (cancelled || mountId !== mountIdRef.current) return;
              if (err) {
                setFormMounted(false);
                setConfigError("Error al cargar el formulario de pago");
                return;
              }
              setFormMounted(true);

              const emailInput = document.getElementById(
                `${activeFormId}__cardholderEmail`,
              ) as HTMLInputElement | null;
              if (emailInput) emailInput.value = email;

              const nameInput = document.getElementById(
                `${activeFormId}__cardholderName`,
              ) as HTMLInputElement | null;
              if (nameInput) nameInput.value = holder;

              const idNumberInput = document.getElementById(
                `${activeFormId}__identificationNumber`,
              ) as HTMLInputElement | null;
              if (idNumberInput) idNumberInput.value = "123456789";

              const idTypeSelect = document.getElementById(
                `${activeFormId}__identificationType`,
              ) as HTMLSelectElement | null;
              if (idTypeSelect) {
                for (const option of Array.from(idTypeSelect.options)) {
                  if (option.value === "Otro" || option.text === "Otro") {
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
              const cfg = configRef.current;
              const testMode = Boolean(
                cfg?.sandbox || cfg?.test_mode || cfg?.test_card,
              );

              try {
                if (publicKeyRef.current !== cfg?.public_key?.trim()) {
                  throw new Error(
                    "La clave de pago cambió. Recarga con Ctrl+Shift+R.",
                  );
                }

                await new Promise((resolve) => window.setTimeout(resolve, 0));
                const data = cardFormRef.current?.getCardFormData();
                if (!data?.token || data.token.length < 20) {
                  throw new Error(
                    "No se pudo tokenizar la tarjeta. Recarga con Ctrl+Shift+R.",
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
                  testMode,
                  payerEmail: resolvePayerEmail(
                    currentCheckout,
                    testMode,
                    cfg,
                  ),
                  identification_type: testMode
                    ? "Otro"
                    : data.identificationType,
                  identification_number: testMode
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
      } catch (err) {
        if (!cancelled && mountId === mountIdRef.current) {
          setConfigError(
            err instanceof Error ? err.message : "Error al iniciar Mercado Pago",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      cardFormRef.current = null;
      setFormMounted(false);
    };
  }, [config, credentialsOk, formId, total, router, clearCart]);

  if (configLoading) {
    return (
      <p className="text-center text-xs text-bruma-mist">
        Cargando pasarela de pago...
      </p>
    );
  }

  if (configError || !config || !credentialsOk || !formId) {
    return (
      <div className="space-y-3">
        <p className="text-center text-xs text-red-500">
          {configError ||
            "No se pudo conectar con Mercado Pago. Recarga con Ctrl+Shift+R."}
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex min-h-[44px] w-full items-center justify-center rounded-full border border-bruma-sand text-sm text-bruma-deep"
          >
            Volver
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isTestMode && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Modo prueba · Tarjeta:{" "}
          {formatCardNumber(testCard?.number ?? "4168818844447115")} · CVV{" "}
          {testCard?.cvv ?? "123"} · vence {testCard?.expiration ?? "11/30"} ·
          titular APRO · doc. Otro · email {mpEmail}
        </div>
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
            readOnly={isTestMode}
            defaultValue={cardholderName}
            className={`${fieldClass}${isTestMode ? " bg-bruma-sand/20" : ""}`}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-bruma-mist">Email</label>
          <input
            id={`${formId}__cardholderEmail`}
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
              readOnly={isTestMode}
              defaultValue={testCard?.identification_number ?? "123456789"}
              className={`${fieldClass}${isTestMode ? " bg-bruma-sand/20" : ""}`}
            />
          </div>
        </div>

        {error && <p className="text-center text-xs text-red-500">{error}</p>}

        {!formMounted && (
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
            disabled={loading || !formMounted}
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-bruma-deep text-sm tracking-wide text-bruma-cream transition active:bg-bruma-deep/85 disabled:opacity-60"
          >
            {loading ? "Procesando..." : `Pagar ${formatCLP(total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
