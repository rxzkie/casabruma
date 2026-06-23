import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MobileNav from "@/components/MobileNav";
import ProductDetail from "@/components/ProductDetail";
import { getProducts, getProductBySlug } from "@/lib/api";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} | Casa Bruma`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: [{ url: product.image_url }],
    },
  };
}

export default async function ProductoPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <main className="min-h-screen bg-bruma-cream pb-nav-safe pt-2 md:pb-0 sm:pt-6">
        <ProductDetail product={product} />
      </main>
      <MobileNav />
    </>
  );
}
