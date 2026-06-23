import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import PromoBanner from "@/components/PromoBanner";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { getProducts, getCategories } from "@/lib/api";
import { getProductImageUrl } from "@/lib/product";

export default async function Home() {
  const [products, categoriesData] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const featured =
    products.find((product) => getProductImageUrl(product)) ?? null;

  return (
    <>
      <main>
        <Hero featured={featured} />
        <PromoBanner />
        <ProductGrid products={products} categories={categoriesData.categories} />
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
