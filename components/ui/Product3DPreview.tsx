"use client";

import type { Product } from "@/lib/types";
import { getProductImageFallback } from "@/lib/productImage";
import { ProductImage } from "@/components/ui/ProductImage";

interface Product3DPreviewProps {
  product: Product;
}

export function Product3DPreview({ product }: Product3DPreviewProps) {
  return (
    <div
      id="product-3d-preview"
      className="glass-card relative aspect-[4/3] max-h-[min(48vh,360px)] w-full overflow-hidden !rounded-2xl sm:aspect-square sm:max-h-[420px] md:max-h-[460px] lg:sticky lg:top-24"
    >
      <ProductImage
        src={product.image || getProductImageFallback(product.category)}
        alt={product.name}
        category={product.category}
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
        priority
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07070d]/30 via-transparent to-transparent" />
    </div>
  );
}
