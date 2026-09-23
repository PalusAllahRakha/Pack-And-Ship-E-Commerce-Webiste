"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/ui/ProductImage";
import { CartQuantityControls } from "@/components/ui/CartQuantityControls";
import { staggerItem } from "@/components/ui/ScrollReveal";

interface ProductCardProps {
  product: Product;
}

const categoryAccent: Record<Product["category"], string> = {
  fruit: "from-emerald-500/20 to-transparent",
  electronics: "from-cyan-500/20 to-transparent",
  furniture: "from-violet-500/20 to-transparent",
};

export function ProductCard({ product }: ProductCardProps) {
  const imageRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div variants={staggerItem} className="h-full">
      <motion.div
        whileHover={{ y: -5, transition: { duration: 0.22 } }}
        className="glass-card group flex h-full flex-col overflow-hidden"
      >
        <Link href={`/product/${product.slug}`} className="block flex-1">
          <div ref={imageRef} className="relative aspect-[4/3] overflow-hidden sm:aspect-[5/4]">
            <div
              className={`absolute inset-0 z-10 bg-gradient-to-b ${categoryAccent[product.category]} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />
            <ProductImage
              src={product.image}
              alt={product.name}
              category={product.category}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
            />
            <div className="product-category-badge absolute left-2 top-2 z-20 rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-200 backdrop-blur sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
              {CATEGORY_LABELS[product.category]}
            </div>
          </div>
          <h3 className="theme-heading line-clamp-2 px-2.5 pt-2.5 text-[11px] font-semibold leading-snug group-hover:text-cyan-300 sm:px-3 sm:pt-3 sm:text-sm md:text-[0.9rem] xl:px-3 xl:text-sm">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex flex-col gap-1.5 p-2.5 pt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:p-3 sm:pt-2">
          <p className="shrink-0 text-xs font-bold gradient-text sm:text-sm xl:text-sm">
            {formatPrice(product.price)}
          </p>
          <div className="min-w-0 w-full sm:w-auto">
            <CartQuantityControls product={product} variant="card" flySourceRef={imageRef} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
