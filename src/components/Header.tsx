import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-bruma-sand/60 bg-bruma-cream/95 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-xl tracking-[0.12em] text-bruma-deep sm:text-2xl sm:tracking-[0.15em]">
            BRUMA
          </span>
          <span className="text-[9px] uppercase tracking-[0.3em] text-bruma-mist sm:text-[10px] sm:tracking-[0.35em]">
            Store
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm tracking-wide text-bruma-deep/70 md:flex">
          <Link href="#catalogo" className="transition hover:text-bruma-rose">
            Catálogo
          </Link>
          <Link href="#novedades" className="transition hover:text-bruma-rose">
            Novedades
          </Link>
          <Link href="#contacto" className="transition hover:text-bruma-rose">
            Contacto
          </Link>
        </nav>
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            type="button"
            className="hidden min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-bruma-deep transition active:bg-bruma-sand/50 sm:flex"
            aria-label="Buscar"
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
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>
          <button
            type="button"
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
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-bruma-rose text-[10px] font-medium text-white">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
