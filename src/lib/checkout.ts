import { API_URL } from "@/lib/config";
import type { CartItem } from "@/types/cart";
import type {
  CardPaymentBody,
  CardPaymentItem,
  CardPaymentResponse,
  CheckoutData,
  MercadoPagoConfig,
  Payment,
} from "@/types/payment";
import { MP_TEST_BUYER_EMAIL } from "@/types/payment";

const CHECKOUT_KEY = "casa-bruma-checkout";
const ORDER_KEY = "lastOrderRef";

export function createOrderReference() {
  return `orden-${Date.now()}`;
}

export function getCardPublicKey(config: MercadoPagoConfig | null): string {
  return config?.public_key?.trim() ?? "";
}

export function isValidCardPublicKey(key: string) {
  return key.startsWith("APP_USR-");
}

export function normalizeChilePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("569") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("56") && digits.length >= 11) return `+${digits}`;
  if (digits.startsWith("9") && digits.length === 9) return `+56${digits}`;
  if (digits.length === 8) return `+569${digits}`;
  return phone.trim();
}

export function getSavedCheckout(): CheckoutData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHECKOUT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CheckoutData;
  } catch {
    return null;
  }
}

export function saveCheckout(data: CheckoutData) {
  localStorage.setItem(CHECKOUT_KEY, JSON.stringify(data));
}

export function saveOrderReference(ref: string) {
  localStorage.setItem(ORDER_KEY, ref);
}

function parseApiError(err: Record<string, unknown>): string {
  const raw = err.message;
  if (Array.isArray(raw)) return raw.join(", ");
  if (typeof raw === "string") return raw;
  if (raw && typeof raw === "object" && "message" in raw) {
    const nested = (raw as { message?: unknown }).message;
    if (typeof nested === "string") return nested;
  }
  return "Error al procesar el pago";
}

export async function getMercadoPagoConfig(): Promise<MercadoPagoConfig | null> {
  try {
    const res = await fetch(`${API_URL}/mercadopago/config`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function payWithCard(
  body: CardPaymentBody,
): Promise<CardPaymentResponse> {
  const res = await fetch(`${API_URL}/mercadopago/payments/card`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(parseApiError(err));
  }

  return res.json();
}

export async function getPaymentByReference(
  reference: string,
): Promise<Payment | null> {
  const res = await fetch(
    `${API_URL}/mercadopago/payments/reference/${encodeURIComponent(reference)}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  return res.json();
}

export function buildCardPaymentBody(
  checkout: CheckoutData,
  payment: {
    amount: number;
    token: string;
    payment_method_id: string;
    installments: number;
    issuer_id?: number;
    description: string;
    external_reference: string;
    identification_type?: string;
    identification_number?: string;
    testMode?: boolean;
    items?: CardPaymentItem[];
  },
): CardPaymentBody {
  const testMode = Boolean(payment.testMode);
  const idType = testMode ? "Otro" : payment.identification_type || "Otro";
  const idNumber = testMode
    ? "123456789"
    : payment.identification_number || "123456789";

  const body: CardPaymentBody = {
    amount: payment.amount,
    token: payment.token,
    payment_method_id: payment.payment_method_id,
    installments: payment.installments,
    description: payment.description,
    external_reference: payment.external_reference,
    ...(testMode ? { test_mode: true } : {}),
    ...(payment.items?.length ? { items: payment.items } : {}),
    payer: {
      email: testMode ? MP_TEST_BUYER_EMAIL : checkout.payer.email.trim(),
      name: testMode ? "APRO" : checkout.payer.name.trim(),
      surname: testMode ? "TEST" : checkout.payer.surname.trim(),
      identification_type: idType,
      identification_number: idNumber,
    },
    shipping: {
      street: checkout.shipping.street.trim(),
      number: checkout.shipping.number.trim(),
      city: checkout.shipping.city.trim(),
      region: checkout.shipping.region.trim(),
      country: checkout.shipping.country.trim() || "CL",
      ...(checkout.shipping.apartment?.trim()
        ? { apartment: checkout.shipping.apartment.trim() }
        : {}),
      ...(checkout.shipping.postal_code?.trim()
        ? { postal_code: checkout.shipping.postal_code.trim() }
        : {}),
    },
  };

  if (checkout.payer.phone?.trim()) {
    body.payer.phone = normalizeChilePhone(checkout.payer.phone);
  }

  if (payment.issuer_id) {
    body.issuer_id = payment.issuer_id;
  }

  return body;
}

export function validateCheckout(checkout: CheckoutData): string | null {
  const { payer, shipping } = checkout;

  if (!payer.name.trim()) return "Ingresa tu nombre";
  if (!payer.surname.trim()) return "Ingresa tu apellido";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payer.email.trim()))
    return "Ingresa un email válido";

  if (payer.phone?.trim()) {
    const phone = normalizeChilePhone(payer.phone);
    if (!/^\+569\d{8}$/.test(phone.replace(/\s/g, "")))
      return "Teléfono inválido. Usa formato +56912345678";
  }

  if (!shipping.street.trim()) return "Ingresa la calle";
  if (!shipping.number.trim()) return "Ingresa el número";
  if (!shipping.city.trim()) return "Ingresa la comuna o ciudad";
  if (!shipping.region.trim()) return "Selecciona la región";

  return null;
}
