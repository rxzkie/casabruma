type MpCheckoutInstance = {
  open: () => void;
};

type MpClient = {
  checkout: (opts: {
    preference: { id: string };
    autoOpen?: boolean;
  }) => MpCheckoutInstance;
};

declare global {
  interface Window {
    MercadoPago?: new (
      publicKey: string,
      options?: { locale?: string },
    ) => MpClient;
  }
}

const MP_SDK_URL = "https://sdk.mercadopago.com/js/v2";

let sdkPromise: Promise<void> | null = null;

function loadMpSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mercado Pago solo en navegador"));
  }
  if (window.MercadoPago) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${MP_SDK_URL}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("No se pudo cargar Mercado Pago")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = MP_SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar Mercado Pago"));
    document.body.appendChild(script);
  });

  return sdkPromise;
}

export async function openMpCheckout(preferenceId: string, publicKey: string) {
  await loadMpSdk();
  if (!window.MercadoPago) {
    throw new Error("SDK de Mercado Pago no disponible");
  }
  const mp = new window.MercadoPago(publicKey, { locale: "es-CL" });
  mp.checkout({
    preference: { id: preferenceId },
    autoOpen: true,
  });
}
