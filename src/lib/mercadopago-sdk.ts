const SDK_ATTR = "data-casa-bruma-mp-sdk";

export function loadMercadoPagoSdk(
  sdkUrl = "https://sdk.mercadopago.com/js/v2",
): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mercado Pago solo en cliente"));
  }

  const existing = document.querySelector<HTMLScriptElement>(`script[${SDK_ATTR}]`);

  if (existing?.src === sdkUrl && window.MercadoPago) {
    return Promise.resolve();
  }

  if (existing) {
    existing.remove();
    delete (window as { MercadoPago?: unknown }).MercadoPago;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = sdkUrl;
    script.async = true;
    script.setAttribute(SDK_ATTR, "true");

    script.onload = () => {
      let attempts = 0;
      const tick = () => {
        if (window.MercadoPago) {
          resolve();
          return;
        }
        attempts += 1;
        if (attempts >= 60) {
          reject(new Error("Mercado Pago SDK no respondió"));
          return;
        }
        window.setTimeout(tick, 50);
      };
      tick();
    };

    script.onerror = () => reject(new Error("No se pudo cargar Mercado Pago SDK"));
    document.body.appendChild(script);
  });
}

export function createMercadoPagoInstance(publicKey: string) {
  return new window.MercadoPago(publicKey.trim(), { locale: "es-CL" });
}
