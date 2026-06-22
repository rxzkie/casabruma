import Link from "next/link";

export default function Footer() {
  return (
    <footer
      id="contacto"
      className="border-t border-bruma-sand/60 bg-bruma-deep text-bruma-cream pb-nav-safe md:pb-0"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16 md:grid-cols-3">
        <div>
          <p className="font-display text-xl tracking-[0.15em] sm:text-2xl">
            BRUMA
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-bruma-mist">
            Store
          </p>
          <p className="mt-3 text-sm leading-relaxed text-bruma-cream/50 sm:mt-4">
            Accesorios aesthetic con vibes costeras. Desde Viña del Mar para
            todo Chile.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-bruma-mist">
            Enlaces
          </p>
          <ul className="mt-3 space-y-2.5 text-sm text-bruma-cream/70 sm:mt-4">
            <li>
              <Link
                href="#catalogo"
                className="inline-flex min-h-[44px] items-center transition active:text-white sm:min-h-0"
              >
                Catálogo
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="inline-flex min-h-[44px] items-center transition active:text-white sm:min-h-0"
              >
                Envíos y devoluciones
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="inline-flex min-h-[44px] items-center transition active:text-white sm:min-h-0"
              >
                Términos y condiciones
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-bruma-mist">
            Contacto
          </p>
          <ul className="mt-3 space-y-2.5 text-sm text-bruma-cream/70 sm:mt-4">
            <li>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center transition active:text-white sm:min-h-0"
              >
                Instagram @bruma.store
              </Link>
            </li>
            <li>
              <Link
                href="https://wa.me/56900000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center transition active:text-white sm:min-h-0"
              >
                WhatsApp +56 9 0000 0000
              </Link>
            </li>
            <li className="pt-1 sm:pt-0">Viña del Mar, Chile</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-[11px] text-bruma-cream/35 sm:py-6 sm:text-xs">
        © {new Date().getFullYear()} Bruma Store. Todos los derechos reservados.
      </div>
    </footer>
  );
}
