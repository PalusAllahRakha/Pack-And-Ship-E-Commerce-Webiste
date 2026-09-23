import type { Category } from "@/lib/types";

const CATEGORY_FALLBACK: Record<Category, string> = {
  fruit: "/images/products/honeycrisp-apples.jpg",
  electronics: "/images/products/wireless-earbuds.jpg",
  furniture: "/images/products/ergonomic-chair.jpg",
};

export function resolveProductImage(image: string, category?: Category): string {
  return image;
}

export function getCategoryFallbackImage(category: Category): string {
  return CATEGORY_FALLBACK[category];
}

export function getProductImageFallback(category: Category): string {
  return CATEGORY_FALLBACK[category];
}
