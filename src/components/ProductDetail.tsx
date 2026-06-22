import Link from "next/link";
import ProductGallery from "@/components/ProductGallery";
import {
  formatCLP,
  getSupplierLinks,
  type Product,
} from "@/data/products";

type ProductDetailProps = {
  product: Product;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const discount =
    product.originalPrice &&
    Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100,
    );
  const links = getSupplierLinks(product.searchQuery);

  return (
    <div className="mx-auto max-w-3xl pb-6 sm:pb-10">
      <ProductGallery images={product.images} name={product.name} />
      <div className="px-4 sm:px-0">
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-bruma-mist sm:text-[11px]">
            {product.category}
          </span>
          {product.badge && (
            <span className="rounded-full bg-bruma-rose px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-white">
              {product.badge}
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
          {product.originalPrice && (
            <span className="text-base text-bruma-deep/35 line-through sm:text-lg">
              {formatCLP(product.originalPrice)}
            </span>
          )}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-bruma-deep/65 sm:text-base">
          {product.description}
        </p>
        <button
          type="button"
          className="mt-6 flex min-h-[48px] w-full items-center justify-center rounded-full bg-bruma-deep text-sm tracking-wide text-bruma-cream transition active:bg-bruma-deep/85 sm:max-w-sm"
        >
          Agregar al carrito
        </button>
        <div className="mt-8 rounded-xl border border-bruma-sand/80 bg-white p-4 sm:rounded-2xl sm:p-6">
          <p className="text-xs uppercase tracking-widest text-bruma-mist">
            Buscar proveedor
          </p>
          <p className="mt-2 text-sm text-bruma-deep/55">
            Referencia:{" "}
            <span className="font-medium text-bruma-deep">
              {product.searchQuery}
            </span>
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href={links.aliexpress}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center justify-center rounded-full border border-bruma-sand bg-bruma-cream px-5 text-sm text-bruma-deep transition active:border-bruma-rose active:text-bruma-rose"
            >
              AliExpress
            </Link>
            <Link
              href={links.temu}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center justify-center rounded-full border border-bruma-sand bg-bruma-cream px-5 text-sm text-bruma-deep transition active:border-bruma-rose active:text-bruma-rose"
            >
              Temu
            </Link>
            <Link
              href={links.google}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center justify-center rounded-full border border-bruma-sand bg-bruma-cream px-5 text-sm text-bruma-deep transition active:border-bruma-rose active:text-bruma-rose"
            >
              Google
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
