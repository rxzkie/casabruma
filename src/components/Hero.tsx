import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-bruma-fog via-bruma-cream to-bruma-blush">
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-bruma-mist/20 blur-3xl sm:h-80 sm:w-80" />
      <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-bruma-rose/10 blur-3xl sm:h-96 sm:w-96" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:py-28">
        <div className="max-w-xl">
          <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-bruma-mist sm:mb-4 sm:text-xs sm:tracking-[0.4em]">
            Viña del Mar · Chile
          </p>
          <h1 className="font-display text-[2rem] leading-[1.1] text-bruma-deep sm:text-5xl lg:text-7xl">
            El detalle que completa tu{" "}
            <span className="italic text-bruma-rose">mood</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-bruma-deep/60 sm:mt-6 sm:text-lg">
            Accesorios aesthetic, joyería y bolsos seleccionados para tu
            estilo costero. Envíos a todo Chile.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link
              href="#catalogo"
              className="flex min-h-[48px] items-center justify-center rounded-full bg-bruma-deep px-6 text-sm tracking-wide text-bruma-cream transition active:bg-bruma-deep/85 sm:min-h-0 sm:px-8 sm:py-3.5"
            >
              Ver catálogo
            </Link>
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[48px] items-center justify-center rounded-full border border-bruma-deep/20 px-6 text-sm tracking-wide text-bruma-deep transition active:border-bruma-rose active:text-bruma-rose sm:min-h-0 sm:px-8 sm:py-3.5"
            >
              @bruma.store
            </Link>
          </div>
        </div>
        <div className="relative mx-auto mt-8 w-full max-w-sm sm:mt-10 sm:max-w-md lg:mt-0 lg:max-w-none">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-3 pt-6 sm:space-y-4 sm:pt-8">
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-white shadow-lg shadow-bruma-deep/5 sm:rounded-2xl">
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=530&fit=crop)",
                  }}
                />
              </div>
              <div className="rounded-xl bg-white/80 p-3 shadow-lg shadow-bruma-deep/5 backdrop-blur sm:rounded-2xl sm:p-5">
                <p className="font-display text-2xl text-bruma-deep sm:text-3xl">
                  +500
                </p>
                <p className="text-xs text-bruma-deep/50 sm:text-sm">
                  clientas felices
                </p>
              </div>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="rounded-xl bg-bruma-deep p-3 text-bruma-cream shadow-lg sm:rounded-2xl sm:p-5">
                <p className="text-[10px] uppercase tracking-widest text-bruma-mist sm:text-xs">
                  Envío gratis
                </p>
                <p className="mt-1 font-display text-xl sm:text-2xl">
                  Sobre $25.000
                </p>
              </div>
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-white shadow-lg shadow-bruma-deep/5 sm:rounded-2xl">
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url(https://images.unsplash.com/photo-1590874103328-eac1423a8f6d?w=400&h=530&fit=crop)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
