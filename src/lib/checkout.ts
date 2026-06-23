import { API_URL } from "@/lib/config";
import type { CartItem } from "@/types/cart";
import type { Payment, PreferenceResponse } from "@/types/payment";

const EMAIL_KEY = "casa-bruma-email";
const ORDER_KEY = "lastOrderRef";

export function createOrderReference() {
  return `orden-${Date.now()}`;
}

export function getSavedEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(EMAIL_KEY) ?? "";
}

export function saveEmail(email: string) {
  localStorage.setItem(EMAIL_KEY, email);
}

export function saveOrderReference(ref: string) {
  localStorage.setItem(ORDER_KEY, ref);
}

export async function createCheckoutPreference(
  items: CartItem[],
  email: string,
  origin: string,
): Promise<PreferenceResponse & { external_reference: string }> {
  const orderRef = createOrderReference();

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
      payer: { email },
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
  saveEmail(email);
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
