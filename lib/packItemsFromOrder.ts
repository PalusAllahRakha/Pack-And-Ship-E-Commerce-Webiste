import { getProductById } from "@/data/products";
import type { PackItemData } from "@/components/three/PackItems";
import type { Category } from "@/lib/types";

export const MAX_PACK_VISUAL_ITEMS = 6;

export interface OrderPackLine {
  productId: string;
  qty: number;
}

export function packItemsFromOrder(items: OrderPackLine[]): PackItemData[] {
  return items
    .flatMap((item) => {
      const product = getProductById(item.productId);
      if (!product) return [];
      return Array.from({ length: item.qty }, () => ({
        slug: product.slug,
        image: product.image,
        category: product.category,
        packStyle: product.packStyle,
      }));
    })
    .slice(0, MAX_PACK_VISUAL_ITEMS);
}

export function deliveryProductsFromOrder(
  items: OrderPackLine[],
): { slug: string; image: string; category: Category }[] {
  return packItemsFromOrder(items).map(({ slug, image, category }) => ({
    slug,
    image,
    category,
  }));
}
