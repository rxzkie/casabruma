"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  createCheckoutPreference,
  getSavedEmail,
  redirectToMercadoPago,
} from "@/lib/checkout";
import { formatCLP } from "@/lib/format";

export default function CheckoutButton() {
  const { items, total } = useCart();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = getSavedEmail();
    if (saved) setEmail(saved);
  }, []);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Ingresa un email válido");
      return;
    }

    setLoading(true);
    try {
      const data = await createCheckoutPreference(
        items,
        email.trim(),
        window.location.origin,
      );
      redirectToMercadoPago(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleCheckout} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
        className="w-full rounded-full border border-bruma-sand bg-white px-4 py-3 text-sm text-bruma-deep outline-none transition focus:border-bruma-rose"
      />
      {error && (
        <p className="text-center text-xs text-red-500">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-bruma-deep text-sm tracking-wide text-bruma-cream transition active:bg-bruma-deep/85 disabled:opacity-60"
      >
        {loading ? "Redirigiendo..." : `Pagar ${formatCLP(total)}`}
      </button>
    </form>
  );
}
