"use client";

import { CartProvider } from "@/context/CartContext";
import { MercadoPagoProvider } from "@/context/MercadoPagoContext";
import Header from "@/components/Header";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MercadoPagoProvider>
      <CartProvider>
        <Header />
        <div className="pt-header-safe">{children}</div>
      </CartProvider>
    </MercadoPagoProvider>
  );
}
