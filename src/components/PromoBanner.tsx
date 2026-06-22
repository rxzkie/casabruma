export default function PromoBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex flex-col items-stretch gap-4 rounded-xl bg-bruma-deep px-5 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:px-8 sm:py-10 sm:text-left">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-bruma-mist sm:text-xs sm:tracking-[0.35em]">
            Primera compra
          </p>
          <p className="mt-1.5 font-display text-2xl leading-tight text-bruma-cream sm:mt-2 sm:text-3xl">
            10% OFF con código BRUMA10
          </p>
        </div>
        <button
          type="button"
          className="min-h-[48px] shrink-0 rounded-full bg-bruma-rose px-6 text-sm tracking-wide text-white transition active:bg-bruma-rose/85 sm:min-h-0 sm:px-8 sm:py-3"
        >
          Copiar código
        </button>
      </div>
    </section>
  );
}
