import { notFound } from "next/navigation";
import { CategoryFilter } from "@/components/ui/CategoryFilter";
import { PageShell } from "@/components/ui/PageShell";
import { ShopCatalog } from "@/components/ui/ShopCatalog";
import { getProductsByCategory } from "@/data/products";
import { CATEGORY_LABELS, isCategory } from "@/lib/types";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isCategory(category)) {
    notFound();
  }

  const filtered = getProductsByCategory(category);

  return (
    <PageShell
      title={CATEGORY_LABELS[category]}
      subtitle={`Browse our ${CATEGORY_LABELS[category].toLowerCase()} collection — same animated checkout and delivery experience.`}
    >
      <CategoryFilter />
      <ShopCatalog
        products={filtered}
        emptyMessage="No products in this category."
      />
    </PageShell>
  );
}
