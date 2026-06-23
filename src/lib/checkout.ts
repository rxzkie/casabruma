import { API_URL } from "@/lib/config";
import type {
  CardPaymentBody,
  CardPaymentResponse,
  CheckoutData,
  MercadoPagoConfig,
  Payment,
} from "@/types/payment";

const CHECKOUT_KEY = "casa-bruma-checkout";
const ORDER_KEY = "lastOrderRef";

export function createOrderReference() {
  return `orden-${Date.now()}`;
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
    const message = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message;
    throw new Error(message ?? "Error al procesar el pago con tarjeta");
  }

  return res.json();
}

export async function getPaymentByReference(
  reference: string,
): Promise<Payment | null> {
  const res = await fetch(
    `${API_URL}/mercadopago/payments/reference/${reference}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  return res.json();
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
