import { API_URL } from "@/lib/config";
import type { CartItem } from "@/types/cart";
import type {
  CheckoutData,
  Payment,
  CheckoutResponse,
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

export async function createCheckout(
  items: CartItem[],
  checkout: CheckoutData,
  origin: string,
): Promise<CheckoutResponse> {
  const orderRef = createOrderReference();

  const payer: Record<string, string> = {
    name: checkout.payer.name.trim(),
    surname: checkout.payer.surname.trim(),
    email: checkout.payer.email.trim(),
  };

  if (checkout.payer.phone?.trim()) {
    payer.phone = normalizeChilePhone(checkout.payer.phone);
  }

  const shipping = {
    street: checkout.shipping.street.trim(),
    number: checkout.shipping.number.trim(),
    city: checkout.shipping.city.trim(),
    region: checkout.shipping.region.trim(),
    country: checkout.shipping.country.trim() || "CL",
  };

  const res = await fetch(`${API_URL}/mercadopago/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((item) => ({
        id: item.id,
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "CLP",
        ...(item.image_url ? { picture_url: item.image_url } : {}),
      })),
      payer,
      shipping,
      external_reference: orderRef,
      back_urls: {
        success: `${origin}/pago/exito?ref=${orderRef}`,
        failure: `${origin}/pago/error?ref=${orderRef}`,
        pending: `${origin}/pago/pendiente?ref=${orderRef}`,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message;
    throw new Error(message ?? "Error al crear el pago");
  }

  const data: CheckoutResponse = await res.json();
  saveCheckout(checkout);
  saveOrderReference(data.external_reference ?? orderRef);
  return data;
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

export function redirectToCheckout(data: CheckoutResponse) {
  if (!data.checkout_url) throw new Error("No se recibió URL de pago");
  window.location.href = data.checkout_url;
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
