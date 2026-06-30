import { API_URL } from "@/lib/config";
import type { CartItem } from "@/types/cart";
import type {
  CheckoutBody,
  CheckoutData,
  CheckoutResponse,
  PaymentCheck,
} from "@/types/payment";

const CHECKOUT_KEY = "casa-bruma-checkout";
const ORDER_KEY = "lastOrderRef";

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

export function buildCheckoutBody(
  checkout: CheckoutData,
  items: CartItem[],
): CheckoutBody {
  return {
    items: items.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    })),
    payer: {
      name: checkout.payer.name.trim(),
      surname: checkout.payer.surname.trim(),
      email: checkout.payer.email.trim(),
      ...(checkout.payer.phone?.trim()
        ? { phone: normalizeChilePhone(checkout.payer.phone) }
        : {}),
    },
    shipping: {
      street: checkout.shipping.street.trim(),
      number: checkout.shipping.number.trim(),
      city: checkout.shipping.city.trim(),
      region: checkout.shipping.region.trim(),
      ...(checkout.shipping.apartment?.trim()
        ? { apartment: checkout.shipping.apartment.trim() }
        : {}),
      ...(checkout.shipping.postal_code?.trim()
        ? { postal_code: checkout.shipping.postal_code.trim() }
        : {}),
    },
  };
}

export function getOrderReference(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ORDER_KEY);
}

export function resolveCheckoutUrl(data: CheckoutResponse): string {
  const sandbox = data.sandboxInitPoint?.includes("sandbox.mercadopago");
  if (sandbox && data.sandboxInitPoint?.trim()) {
    return data.sandboxInitPoint.trim();
  }
  if (data.initPoint?.trim()) {
    return data.initPoint.trim();
  }
  throw new Error("Mercado Pago no devolvió URL de checkout");
}

export async function createCheckout(
  body: CheckoutBody,
): Promise<CheckoutResponse> {
  const res = await fetch(`${API_URL}/payment/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(parseApiError(err));
  }

  const data: CheckoutResponse = await res.json();
  console.info("[MP checkout] respuesta backend:", data);
  return data;
}

export async function checkPayment(
  reference: string,
): Promise<PaymentCheck | null> {
  const res = await fetch(
    `${API_URL}/payment/check/${encodeURIComponent(reference)}`,
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
