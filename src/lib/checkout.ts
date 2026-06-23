import { API_URL } from "@/lib/config";
import type { CartItem } from "@/types/cart";
import type {
  CheckoutData,
  Payment,
  PreferenceResponse,
} from "@/types/payment";

const CHECKOUT_KEY = "casa-bruma-checkout";
const ORDER_KEY = "lastOrderRef";

export function createOrderReference() {
  return `orden-${Date.now()}`;
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

export async function createCheckoutPreference(
  items: CartItem[],
  checkout: CheckoutData,
  origin: string,
): Promise<PreferenceResponse & { external_reference: string }> {
  const orderRef = createOrderReference();

  const shipping = {
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
  };

  const res = await fetch(`${API_URL}/mercadopago/preference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((item) => ({
        id: item.id,
        title: item.name,
        picture_url: item.image_url || undefined,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "CLP",
      })),
      payer: {
        name: checkout.payer.name.trim(),
        surname: checkout.payer.surname.trim(),
        email: checkout.payer.email.trim(),
        phone: checkout.payer.phone.trim(),
      },
      shipping,
      external_reference: orderRef,
      back_urls: {
        success: `${origin}/pago-exitoso?ref=${orderRef}`,
        failure: `${origin}/pago-fallido?ref=${orderRef}`,
        pending: `${origin}/pago-pendiente?ref=${orderRef}`,
      },
      statement_descriptor: "CASA BRUMA",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message)
      ? err.message.join(", ")
      : err.message;
    throw new Error(message ?? "Error al crear el pago");
  }

  const data: PreferenceResponse = await res.json();
  saveCheckout(checkout);
  saveOrderReference(orderRef);
  return { ...data, external_reference: orderRef };
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

export function redirectToMercadoPago(data: PreferenceResponse) {
  const url = data.init_point || data.sandbox_init_point;
  if (!url) throw new Error("No se recibió URL de pago");
  window.location.href = url;
}

export function validateCheckout(checkout: CheckoutData): string | null {
  const { payer, shipping } = checkout;

  if (!payer.name.trim()) return "Ingresa tu nombre";
  if (!payer.surname.trim()) return "Ingresa tu apellido";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payer.email.trim()))
    return "Ingresa un email válido";
  if (!/^\+?[\d\s-]{8,}$/.test(payer.phone.trim()))
    return "Ingresa un teléfono válido";
  if (!shipping.street.trim()) return "Ingresa la calle";
  if (!shipping.number.trim()) return "Ingresa el número";
  if (!shipping.city.trim()) return "Ingresa la comuna o ciudad";
  if (!shipping.region.trim()) return "Selecciona la región";

  return null;
}
