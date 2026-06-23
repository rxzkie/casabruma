"use client";

import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <div className="pt-header-safe">{children}</div>
    </CartProvider>
  );
}
