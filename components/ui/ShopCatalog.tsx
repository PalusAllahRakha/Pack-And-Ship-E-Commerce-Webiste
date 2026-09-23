"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import {
  searchProducts,
  sortProducts,
  type ProductSort,
} from "@/data/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { StaggerGrid } from "@/components/ui/ScrollReveal";
import { PRODUCT_GRID_CLASS } from "@/lib/productGrid";

interface ShopCatalogProps {
  products: Product[];
  emptyMessage?: string;
}

export function ShopCatalog({
  products,
  emptyMessage = "No products match your search.",
}: ShopCatalogProps) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ProductSort>("name");

  const visible = useMemo(
    () => sortProducts(searchProducts(products, query), sort),
    [products, query, sort],
  );

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Search products</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="input-field !py-2.5 pl-10"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
            ⌕
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="shrink-0">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ProductSort)}
            className="input-field !w-auto !py-2 !pr-8"
            aria-label="Sort products"
          >
            <option value="name">Name</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-zinc-400">{emptyMessage}</p>
      ) : (
        <StaggerGrid className={PRODUCT_GRID_CLASS}>
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </StaggerGrid>
      )}
    </>
  );
}
