"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  buildCheckoutProBody,
  createCheckoutPro,
  createOrderReference,
  getSavedCheckout,
  saveCheckout,
  saveOrderReference,
  validateCheckout,
} from "@/lib/checkout";
import { formatCLP } from "@/lib/format";
import {
  CHILE_REGIONS,
  EMPTY_CHECKOUT,
  type CheckoutData,
} from "@/types/payment";

const inputClass =
  "w-full rounded-xl border border-bruma-sand bg-white px-3 py-2.5 text-sm text-bruma-deep outline-none transition focus:border-bruma-rose";

type CheckoutFormProps = {
  onContinue?: () => void;
};

export default function CheckoutForm({ onContinue }: CheckoutFormProps) {
  const { items, total } = useCart();
  const [form, setForm] = useState<CheckoutData>(EMPTY_CHECKOUT);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = getSavedCheckout();
    if (saved) setForm(saved);
  }, []);

  function updatePayer(field: keyof CheckoutData["payer"], value: string) {
    setForm((prev) => ({
      ...prev,
      payer: { ...prev.payer, [field]: value },
    }));
  }

  function updateShipping(
    field: keyof CheckoutData["shipping"],
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      shipping: { ...prev.shipping, [field]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const validationError = validateCheckout(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!items.length) {
      setError("Tu carrito está vacío");
      return;
    }

    saveCheckout(form);
    setLoading(true);

    try {
      const ref = createOrderReference();
      const body = buildCheckoutProBody(form, items, ref);
      const result = await createCheckoutPro(body);
      saveOrderReference(result.external_reference ?? ref);
      onContinue?.();
      window.location.href = result.checkout_url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al iniciar el pago",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-bruma-mist">
          Datos personales
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={form.payer.name}
            onChange={(e) => updatePayer("name", e.target.value)}
            placeholder="Nombre"
            required
            disabled={loading}
            className={inputClass}
          />
          <input
            type="text"
            value={form.payer.surname}
            onChange={(e) => updatePayer("surname", e.target.value)}
            placeholder="Apellido"
            required
            disabled={loading}
            className={inputClass}
          />
        </div>
        <input
          type="email"
          value={form.payer.email}
          onChange={(e) => updatePayer("email", e.target.value)}
          placeholder="Email"
          required
          disabled={loading}
          className={`${inputClass} mt-2`}
        />
        <input
          type="tel"
          value={form.payer.phone ?? ""}
          onChange={(e) => updatePayer("phone", e.target.value)}
          placeholder="Teléfono (+56912345678) opcional"
          disabled={loading}
          className={`${inputClass} mt-2`}
        />
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-bruma-mist">
          Envío
        </p>
        <input
          type="text"
          value={form.shipping.street}
          onChange={(e) => updateShipping("street", e.target.value)}
          placeholder="Calle"
          required
          disabled={loading}
          className={inputClass}
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="text"
            value={form.shipping.number}
            onChange={(e) => updateShipping("number", e.target.value)}
            placeholder="Número"
            required
            disabled={loading}
            className={inputClass}
          />
          <input
            type="text"
            value={form.shipping.apartment}
            onChange={(e) => updateShipping("apartment", e.target.value)}
            placeholder="Depto (opcional)"
            disabled={loading}
            className={inputClass}
          />
        </div>
        <input
          type="text"
          value={form.shipping.city}
          onChange={(e) => updateShipping("city", e.target.value)}
          placeholder="Comuna / Ciudad"
          required
          disabled={loading}
          className={`${inputClass} mt-2`}
        />
        <select
          value={form.shipping.region}
          onChange={(e) => updateShipping("region", e.target.value)}
          required
          disabled={loading}
          className={`${inputClass} mt-2`}
        >
          {CHILE_REGIONS.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs leading-relaxed text-bruma-deep/55">
        Serás redirigido a Mercado Pago para pagar con tarjeta u otros medios
        disponibles.
      </p>

      {error && <p className="text-center text-xs text-red-500">{error}</p>}

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
