"use client";

import Script from "next/script";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getCardPublicKey,
  getMercadoPagoConfig,
  isValidCardPublicKey,
} from "@/lib/checkout";
import type { MercadoPagoConfig } from "@/types/payment";

type MercadoPagoContextValue = {
  config: MercadoPagoConfig | null;
  cardPublicKey: string;
  sdkReady: boolean;
  loading: boolean;
  ready: boolean;
};

const MercadoPagoContext = createContext<MercadoPagoContextValue>({
  config: null,
  cardPublicKey: "",
  sdkReady: false,
  loading: true,
  ready: false,
});

export function useMercadoPago() {
  return useContext(MercadoPagoContext);
}

export function MercadoPagoProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<MercadoPagoConfig | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMercadoPagoConfig()
      .then(setConfig)
      .finally(() => setLoading(false));
  }, []);

  const cardPublicKey = useMemo(() => getCardPublicKey(config), [config]);
  const validKey = isValidCardPublicKey(cardPublicKey);
  const sdkUrl = config?.sdk_url ?? "https://sdk.mercadopago.com/js/v2";
  const ready = !loading && validKey && sdkReady;

  return (
    <MercadoPagoContext.Provider
      value={{ config, cardPublicKey, sdkReady, loading, ready }}
    >
      {validKey && (
        <Script
          src={sdkUrl}
          strategy="afterInteractive"
          onLoad={() => setSdkReady(true)}
        />
      )}
      {children}
    </MercadoPagoContext.Provider>
  );
}
