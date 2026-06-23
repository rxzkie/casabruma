import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import { formatCLP } from "@/lib/format";
import { getProductImages } from "@/lib/product";
import type { ApiProduct } from "@/types/product";

type ProductDetailProps = {
  product: ApiProduct;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const discount = product.discount_percentage;

  return (
    <div className="mx-auto max-w-3xl pb-6 sm:pb-10">
      <ProductGallery images={getProductImages(product)} name={product.name} />
      <div className="px-4 sm:px-0">
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-bruma-mist sm:text-[11px]">
            {product.category}
          </span>
          {product.tag && (
            <span className="rounded-full bg-bruma-rose px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-white">
              {product.tag}
            </span>
          )}
          {discount && (
            <span className="rounded-full bg-bruma-deep px-2.5 py-0.5 text-[10px] font-medium text-bruma-cream">
              -{discount}%
            </span>
          )}
        </div>
        <h1 className="mt-2 font-display text-2xl leading-tight text-bruma-deep sm:text-3xl">
          {product.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="text-2xl font-medium text-bruma-deep sm:text-3xl">
            {formatCLP(product.price)}
          </span>
          {product.original_price && (
            <span className="text-base text-bruma-deep/35 line-through sm:text-lg">
              {formatCLP(product.original_price)}
            </span>
          )}
        </div>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-bruma-deep/65 sm:text-base">
          {product.description}
        </p>
        {product.stock === 0 ? (
          <div className="mt-6 flex min-h-[48px] items-center justify-center rounded-full bg-bruma-sand/50 text-sm tracking-wide text-bruma-deep/50">
            Producto agotado
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <AddToCartButton product={product} />
            <Link
              href={`https://wa.me/56900000000?text=${encodeURIComponent(`Hola! Quiero pedir: ${product.name}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-bruma-deep/20 text-sm tracking-wide text-bruma-deep transition active:border-bruma-rose active:text-bruma-rose"
            >
              Pedir por WhatsApp
            </Link>
          </div>
        )}
        <div className="mt-8 rounded-xl border border-bruma-sand/80 bg-white p-4 sm:rounded-2xl sm:p-6">
          <p className="text-xs uppercase tracking-widest text-bruma-mist">
            Envío
          </p>
          <p className="mt-2 text-sm leading-relaxed text-bruma-deep/65">
            Despacho a todo Chile. Tiempo estimado 5–10 días hábiles según tu
            comuna.
          </p>
        </div>
      </div>
    </div>
  );
}
