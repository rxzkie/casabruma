"use client";

import Script from "next/script";
import {
  createContext,
  useCallback,
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
  refreshConfig: () => Promise<void>;
};

const MercadoPagoContext = createContext<MercadoPagoContextValue>({
  config: null,
  cardPublicKey: "",
  sdkReady: false,
  loading: true,
  ready: false,
  refreshConfig: async () => {},
});

export function useMercadoPago() {
  return useContext(MercadoPagoContext);
}

function waitForMercadoPago(onReady: () => void) {
  let attempts = 0;
  const tick = () => {
    if (typeof window !== "undefined" && window.MercadoPago) {
      onReady();
      return;
    }
    attempts += 1;
    if (attempts < 40) setTimeout(tick, 50);
  };
  tick();
}

export function MercadoPagoProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<MercadoPagoConfig | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshConfig = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getMercadoPagoConfig();
      setConfig(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const cardPublicKey = useMemo(() => getCardPublicKey(config), [config]);
  const sandbox = Boolean(config?.sandbox);
  const validKey = isValidCardPublicKey(cardPublicKey, sandbox);
  const credentialsOk = config?.credentials_ok === true;
  const sdkUrl = config?.sdk_url ?? "https://sdk.mercadopago.com/js/v2";
  const ready = !loading && validKey && credentialsOk && sdkReady;

  return (
    <MercadoPagoContext.Provider
      value={{ config, cardPublicKey, sdkReady, loading, ready, refreshConfig }}
    >
      {validKey && credentialsOk && (
        <Script
          key={cardPublicKey}
          src={sdkUrl}
          strategy="afterInteractive"
          onLoad={() => {
            setSdkReady(false);
            waitForMercadoPago(() => setSdkReady(true));
          }}
        />
      )}
      {children}
    </MercadoPagoContext.Provider>
  );
}
