import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BackHeader from "@/components/BackHeader";
import MobileNav from "@/components/MobileNav";
import ProductDetail from "@/components/ProductDetail";
import { getProductById, products } from "@/data/products";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `${product.name} | Bruma Store`,
    description: product.description,
  };
}

export default async function ProductoPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  return (
    <>
      <BackHeader />
      <main className="min-h-screen bg-bruma-cream pb-nav-safe pt-2 md:pb-0 sm:pt-6">
        <ProductDetail product={product} />
      </main>
      <MobileNav />
    </>
  );
}
