import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  AddToCartButton,
  CategoryBadge,
  PackStyleBadge,
} from "@/components/ui/AddToCartButton";
import { Product3DPreview } from "@/components/ui/Product3DPreview";
import { RelatedProducts } from "@/components/ui/RelatedProducts";
import { PageShell } from "@/components/ui/PageShell";
import { getProductBySlug } from "@/data/products";
import { formatPrice } from "@/lib/format";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: "Product not found | Pack & Ship" };
  }
  return {
    title: `${product.name} | Pack & Ship`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <PageShell hideTitle>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14">
        <Product3DPreview product={product} />
        <div className="flex flex-col justify-center">
          <div className="mb-3 flex flex-wrap gap-2 sm:mb-4">
            <CategoryBadge category={product.category} />
            <PackStyleBadge packStyle={product.packStyle} />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-50 sm:mb-3 sm:text-3xl md:text-4xl">
            {product.name}
          </h1>
          <p className="mb-4 text-2xl font-bold gradient-text sm:mb-6 sm:text-3xl">
            {formatPrice(product.price)}
          </p>
          <p className="mb-6 text-sm leading-relaxed text-zinc-400 sm:mb-8 sm:text-base">
            {product.description}
          </p>
          <AddToCartButton product={product} />
        </div>
      </div>
      <RelatedProducts product={product} />
    </PageShell>
  );
}
