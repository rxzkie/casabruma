import Link from "next/link";

export default function BackHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-bruma-sand/60 bg-bruma-cream/95 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-14 max-w-3xl items-center px-4 sm:h-16">
        <Link
          href="/#catalogo"
          className="flex min-h-[44px] min-w-[44px] items-center gap-2 text-sm text-bruma-deep transition active:text-bruma-rose"
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
          <span>Volver</span>
        </Link>
      </div>
    </header>
  );
}
