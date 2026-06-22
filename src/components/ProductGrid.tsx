"use client";

import { useState } from "react";
import { categories, products } from "@/data/products";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
  const [active, setActive] = useState<string>("Todos");

  const filtered =
    active === "Todos"
      ? products
      : products.filter((p) => p.category === active);

  return (
    <section id="catalogo" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="text-center">
        <p
          id="novedades"
          className="text-[10px] uppercase tracking-[0.3em] text-bruma-mist sm:text-xs sm:tracking-[0.4em]"
        >
          Colección 2026
        </p>
        <h2 className="mt-2 font-display text-3xl text-bruma-deep sm:mt-3 sm:text-4xl lg:text-5xl">
          Nuestro catálogo
        </h2>
        <p className="mx-auto mt-3 max-w-lg px-2 text-sm text-bruma-deep/55 sm:mt-4 sm:text-base">
          Piezas trending seleccionadas para regalo, daily look y mood
          aesthetic.
        </p>
      </div>
      <div className="-mx-4 mt-8 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:mt-10 sm:overflow-visible sm:px-0">
        <div className="flex w-max gap-2 sm:w-auto sm:flex-wrap sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`min-h-[40px] shrink-0 rounded-full px-4 py-2 text-sm tracking-wide transition active:scale-95 sm:px-5 ${
                active === cat
                  ? "bg-bruma-deep text-bruma-cream"
                  : "bg-bruma-sand/40 text-bruma-deep/70 active:bg-bruma-sand"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:mt-12 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
