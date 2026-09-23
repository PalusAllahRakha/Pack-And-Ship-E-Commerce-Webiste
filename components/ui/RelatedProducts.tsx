import Link from "next/link";
import type { Product } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { getRelatedProducts } from "@/data/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface RelatedProductsProps {
  product: Product;
}

export function RelatedProducts({ product }: RelatedProductsProps) {
  const related = getRelatedProducts(product);
  if (related.length === 0) return null;

  return (
    <ScrollReveal className="mt-12 border-t border-white/8 pt-10 sm:mt-14">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="section-label mb-1">You may also like</p>
          <h2 className="text-lg font-bold text-zinc-50 sm:text-xl">
            More {CATEGORY_LABELS[product.category]}
          </h2>
        </div>
        <Link
          href={`/shop/${product.category}`}
          className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </ScrollReveal>
  );
}
