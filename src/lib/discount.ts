import { API_URL } from "@/lib/config";

export type DiscountInfo = {
  code: string;
  percent: number;
};

const STORAGE_KEY = "casa-bruma-discount";

export function getSavedDiscount(): DiscountInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DiscountInfo;
  } catch {
    return null;
  }
}

export function saveDiscount(discount: DiscountInfo) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(discount));
}

export function clearSavedDiscount() {
  localStorage.removeItem(STORAGE_KEY);
}

export function calcDiscountAmount(subtotal: number, percent: number) {
  if (percent <= 0) return 0;
  const total = Math.max(1, Math.round(subtotal * (100 - percent) / 100));
  return Math.max(0, subtotal - total);
}

export function calcDiscountedTotal(subtotal: number, percent: number) {
  if (percent <= 0) return subtotal;
  return Math.max(1, Math.round(subtotal * (100 - percent) / 100));
}

export async function validateDiscountCode(code: string): Promise<DiscountInfo> {
  const res = await fetch(`${API_URL}/payment/discount/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: code.trim() }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      typeof err.message === "string"
        ? err.message
        : "Codigo de descuento invalido";
    throw new Error(message);
  }

  const data = await res.json();
  return { code: data.code, percent: data.percent };
}
