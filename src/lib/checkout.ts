import { API_URL, IS_MP_SANDBOX, MP_PUBLIC_KEY } from "@/lib/config";
import { openMpCheckout } from "@/lib/mp-sdk";
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
  const url = IS_MP_SANDBOX ? data.sandboxInitPoint : data.initPoint;
  if (!url?.trim()) {
    throw new Error("Mercado Pago no devolvió URL de checkout");
  }
  const trimmed = url.trim();
  if (
    trimmed.toLowerCase().includes("mercadolibre.com") &&
    trimmed.toLowerCase().includes("login")
  ) {
    throw new Error(
      "Mercado Pago devolvió login. Configura Checkout Pro y credenciales APP_USR en Render.",
    );
  }
  if (!trimmed.toLowerCase().includes("mercadopago")) {
    throw new Error("URL de checkout inválida");
  }
  return trimmed;
}

export async function redirectToMpCheckout(data: CheckoutResponse) {
  if (MP_PUBLIC_KEY && data.preferenceId) {
    try {
      await openMpCheckout(data.preferenceId, MP_PUBLIC_KEY);
      return;
    } catch (err) {
      console.warn("[MP checkout] SDK fallo, usando redirect:", err);
    }
  }
  window.location.href = resolveCheckoutUrl(data);
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
