"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";
import { CartQuantityControls } from "@/components/ui/CartQuantityControls";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const handleBuyNow = () => {
    addItem(product.id, 1);
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <CartQuantityControls
        product={product}
        variant="detail"
        flyFromId="product-3d-preview"
        openDrawerOnAdd
      />
      <motion.button
        type="button"
        onClick={handleBuyNow}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        className="btn btn-secondary !py-3"
      >
        Buy Now
      </motion.button>
    </div>
  );
}

export function PackStyleBadge({ packStyle }: { packStyle: Product["packStyle"] }) {
  const labels: Record<Product["packStyle"], string> = {
    "soft-drop": "Soft-drop packing",
    "bubble-wrap": "Bubble-wrap protected",
    disassembled: "Flat-pack assembly",
  };

  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-400">
      {labels[packStyle]}
    </span>
  );
}

export function CategoryBadge({ category }: { category: Product["category"] }) {
  const colors: Record<Product["category"], string> = {
    fruit: "from-emerald-500/20 to-emerald-500/5 text-emerald-300 ring-emerald-500/30",
    electronics: "from-cyan-500/20 to-cyan-500/5 text-cyan-300 ring-cyan-500/30",
    furniture: "from-violet-500/20 to-violet-500/5 text-violet-300 ring-violet-500/30",
  };

  return (
    <span
      className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-medium ring-1 ${colors[category]}`}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}
