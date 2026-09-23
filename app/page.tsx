import { HeroSection } from "@/components/ui/HeroSection";
import { PageShell } from "@/components/ui/PageShell";
import { StaggerGrid, ScrollReveal } from "@/components/ui/ScrollReveal";
import { ProductCard } from "@/components/ui/ProductCard";
import { products } from "@/data/products";
import { PRODUCT_GRID_CLASS } from "@/lib/productGrid";
import Link from "next/link";

export default function HomePage() {
  const featured = products.slice(0, 5);

  return (
    <>
      <div className="site-container w-full pt-4 sm:pt-6 md:pt-10">
        <HeroSection />
      </div>

      <PageShell hideTitle>
        <ScrollReveal>
          <div id="featured-shop" className="mb-6 flex flex-col gap-3 scroll-mt-20 sm:mb-8 sm:flex-row sm:items-end sm:justify-between md:scroll-mt-24">
            <div>
              <p className="section-label mb-2">Curated picks</p>
              <h2 className="theme-heading text-xl font-bold sm:text-2xl md:text-3xl">
                Featured Products
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-sm font-medium text-cyan-400 transition-colors hover:text-cyan-300 sm:inline"
            >
              View all →
            </Link>
          </div>
        </ScrollReveal>
        <StaggerGrid className={PRODUCT_GRID_CLASS}>
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </StaggerGrid>
      </PageShell>
    </>
  );
}
