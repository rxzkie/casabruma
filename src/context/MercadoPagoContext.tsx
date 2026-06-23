"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getMercadoPagoConfig } from "@/lib/checkout";
import type { MercadoPagoConfig } from "@/types/payment";

type MercadoPagoContextValue = {
  config: MercadoPagoConfig | null;
  loading: boolean;
  refreshConfig: () => Promise<MercadoPagoConfig | null>;
};

const MercadoPagoContext = createContext<MercadoPagoContextValue>({
  config: null,
  loading: true,
  refreshConfig: async () => null,
});

export function useMercadoPago() {
  return useContext(MercadoPagoContext);
}

export function MercadoPagoProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<MercadoPagoConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshConfig = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getMercadoPagoConfig();
      setConfig(next);
      return next;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  return (
    <MercadoPagoContext.Provider value={{ config, loading, refreshConfig }}>
      {children}
    </MercadoPagoContext.Provider>
  );
}
