import Link from "next/link";
import ProductImage from "./ProductImage";
import { formatCLP } from "@/lib/format";
import { getProductImageUrl } from "@/lib/product";
import type { ApiProduct } from "@/types/product";

type ProductCardProps = {
  product: ApiProduct;
};

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.discount_percentage;
  const imageUrl = getProductImageUrl(product);

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col active:opacity-90"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-bruma-sand/30 sm:rounded-2xl">
        <ProductImage
          src={imageUrl ?? ""}
          alt={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition duration-500 md:group-hover:scale-105"
        />
        {product.tag && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-bruma-rose px-2 py-0.5 text-[10px] uppercase tracking-wider text-white sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[11px]">
            {product.tag}
          </span>
        )}
        {discount && (
          <span className="absolute right-2 top-2 z-10 rounded-full bg-bruma-deep px-2 py-0.5 text-[10px] font-medium text-bruma-cream sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[11px]">
            -{discount}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-bruma-cream/60 backdrop-blur-sm">
            <span className="text-xs font-medium uppercase tracking-widest text-bruma-deep/60">
              Agotado
            </span>
          </div>
        )}
        <span className="absolute bottom-2 left-2 right-2 z-10 flex min-h-[40px] items-center justify-center rounded-full bg-white/95 py-2 text-xs tracking-wide text-bruma-deep shadow-lg backdrop-blur sm:bottom-3 sm:left-3 sm:right-3 sm:py-2.5 sm:text-sm md:translate-y-2 md:opacity-0 md:transition md:duration-300 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          Ver detalle
        </span>
      </div>
      <div className="mt-2.5 flex flex-1 flex-col sm:mt-4">
        <p className="text-[10px] uppercase tracking-widest text-bruma-mist sm:text-[11px]">
          {product.category}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-bruma-deep sm:mt-1 sm:text-base">
          {product.name}
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-1.5 pt-2 sm:gap-2 sm:pt-3">
          <span className="text-sm font-medium text-bruma-deep sm:text-lg">
            {formatCLP(product.price)}
          </span>
          {product.original_price && (
            <span className="text-xs text-bruma-deep/35 line-through sm:text-sm">
              {formatCLP(product.original_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
