"use client";

import { useState } from "react";
import ProductImage from "./ProductImage";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const gallery = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const current = gallery[active] ?? gallery[0] ?? "";

  return (
    <div className="w-full">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-bruma-sand/30 sm:mx-auto sm:aspect-square sm:max-h-[480px] sm:max-w-[480px] sm:rounded-2xl">
        {current ? (
          <ProductImage
            src={current}
            alt={name}
            priority
            sizes="(max-width: 640px) 100vw, 480px"
            className="object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-bruma-sand/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="h-10 w-10 text-bruma-mist"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
              />
            </svg>
          </div>
        )}
      </div>
      {gallery.length > 1 && (
        <>
          <div className="mt-3 flex gap-2 overflow-x-auto px-4 scrollbar-hide sm:px-0">
            {gallery.map((img, i) => (
              <button
                key={`${img}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-bruma-sand/30 sm:h-20 sm:w-20 ${
                  active === i
                    ? "ring-2 ring-bruma-rose ring-offset-2"
                    : "opacity-70"
                }`}
              >
                <ProductImage
                  src={img}
                  alt={`${name} ${i + 1}`}
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            ))}
          </div>
          <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
            {gallery.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  active === i ? "w-4 bg-bruma-rose" : "w-1.5 bg-bruma-sand"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
