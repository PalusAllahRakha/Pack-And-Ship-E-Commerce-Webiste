import dynamic from "next/dynamic";
import { PageShell } from "@/components/ui/PageShell";
import { products } from "@/data/products";

const CategoryFilter = dynamic(() =>
  import("@/components/ui/CategoryFilter").then((m) => ({ default: m.CategoryFilter })),
);

const ShopCatalog = dynamic(() =>
  import("@/components/ui/ShopCatalog").then((m) => ({ default: m.ShopCatalog })),
);

export default function ShopPage() {
  return (
    <PageShell
      title="Shop"
      subtitle="Browse fruits, electronics, and furniture — with animated packing and delivery."
    >
      <CategoryFilter />
      <ShopCatalog products={products} />
    </PageShell>
  );
}
