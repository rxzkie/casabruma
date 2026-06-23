import { API_URL } from "@/lib/config";
import type { CartItem } from "@/types/cart";
import type {
  CheckoutData,
  MercadoPagoConfig,
  Payment,
  PreferenceResponse,
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

export function resolveCheckoutUrl(
  data: PreferenceResponse,
  config: MercadoPagoConfig | null,
): string {
  const isLogin = (url: string) =>
    /mercadolibre\.com.*\/login|\/lgz\/msl\/login/i.test(url);

  const production = [data.init_point, data.checkout_url];
  const sandbox = [
    data.sandbox_init_point,
    data.init_point,
    data.checkout_url,
  ];

  const candidates = config?.sandbox ? sandbox : production;
  const valid = candidates.find((url) => url && !isLogin(url));

  if (valid) return valid;

  const fallback = candidates.find(Boolean);
  if (!fallback) throw new Error("No se recibió URL de pago");
  return fallback;
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
  const phone = normalizeChilePhone(checkout.payer.phone);

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
        category_id: "others",
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "CLP",
      })),
      payer: {
        name: checkout.payer.name.trim(),
        surname: checkout.payer.surname.trim(),
        email: checkout.payer.email.trim(),
        phone,
      },
      shipping,
      external_reference: orderRef,
      back_urls: {
        success: `${origin}/pago-exitoso?ref=${orderRef}`,
        failure: `${origin}/pago-fallido?ref=${orderRef}`,
        pending: `${origin}/pago-pendiente?ref=${orderRef}`,
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

  const data: PreferenceResponse = await res.json();
  saveCheckout({ ...checkout, payer: { ...checkout.payer, phone } });
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

export async function redirectToMercadoPago(data: PreferenceResponse) {
  const config = await getMercadoPagoConfig();
  const url = resolveCheckoutUrl(data, config);
  window.location.href = url;
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

export function validateCheckout(checkout: CheckoutData): string | null {
  const { payer, shipping } = checkout;

  if (!payer.name.trim()) return "Ingresa tu nombre";
  if (!payer.surname.trim()) return "Ingresa tu apellido";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payer.email.trim()))
    return "Ingresa un email válido";

  const phone = normalizeChilePhone(payer.phone);
  if (!/^\+569\d{8}$/.test(phone.replace(/\s/g, "")))
    return "Teléfono inválido. Usa formato +56912345678";

  if (!shipping.street.trim()) return "Ingresa la calle";
  if (!shipping.number.trim()) return "Ingresa el número";
  if (!shipping.city.trim()) return "Ingresa la comuna o ciudad";
  if (!shipping.region.trim()) return "Selecciona la región";

  return null;
}
