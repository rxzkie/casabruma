"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Logo from "./Logo";
import CartDrawer from "./CartDrawer";

export default function Header() {
  const pathname = usePathname();
  const { itemCount, openCart } = useCart();
  const isProductPage = pathname.startsWith("/producto/");

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-bruma-sand/60 bg-bruma-cream/95 backdrop-blur-md pt-safe">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {isProductPage && (
              <Link
                href="/#catalogo"
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-bruma-deep transition active:bg-bruma-sand/50"
                aria-label="Volver"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
                  />
                </svg>
              </Link>
            )}
            <Logo size="md" />
          </div>
          <nav className="hidden items-center gap-8 text-sm tracking-wide text-bruma-deep/70 md:flex">
            <Link href="/#catalogo" className="transition hover:text-bruma-rose">
              Catálogo
            </Link>
            <Link href="/#novedades" className="transition hover:text-bruma-rose">
              Novedades
            </Link>
            <Link href="/#contacto" className="transition hover:text-bruma-rose">
              Contacto
            </Link>
          </nav>
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={openCart}
              className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-bruma-deep transition active:bg-bruma-sand/50"
              aria-label="Carrito"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bruma-rose px-1 text-[10px] font-medium text-white">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
