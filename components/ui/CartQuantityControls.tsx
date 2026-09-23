"use client";

import { useRef, useState, type RefObject } from "react";
import type { Product } from "@/lib/types";
import { useCartHydrated } from "@/lib/useCartHydrated";
import { flyProductToCart } from "@/lib/cartFly";
import { useCartStore } from "@/store/cartStore";

interface CartQuantityControlsProps {
  product: Product;
  variant?: "card" | "detail";
  flyFromId?: string;
  flySourceRef?: RefObject<HTMLElement | null>;
  openDrawerOnAdd?: boolean;
}

const CARD_SLOT_CLASS =
  "flex h-8 w-full items-center justify-between sm:h-9 sm:w-[5.75rem] sm:justify-end";

export function CartQuantityControls({
  product,
  variant = "card",
  flyFromId,
  flySourceRef,
  openDrawerOnAdd = false,
}: CartQuantityControlsProps) {
  const hydrated = useCartHydrated();
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const cartQty = useCartStore(
    (s) => s.items.find((i) => i.productId === product.id)?.qty ?? 0,
  );
  const imageRef = useRef<HTMLDivElement>(null);
  const [adding, setAdding] = useState(false);

  const qty = hydrated ? cartQty : 0;
  const isCard = variant === "card";

  const runFly = () => {
    const from =
      (flyFromId ? document.getElementById(flyFromId) : null) ??
      flySourceRef?.current ??
      imageRef.current;
    flyProductToCart(product.image, from);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    runFly();
    addItem(product.id, 1);
    if (openDrawerOnAdd) {
      setTimeout(() => {
        openDrawer();
        setAdding(false);
      }, 680);
    } else {
      setTimeout(() => setAdding(false), 300);
    }
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    updateQty(product.id, qty - 1);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id, 1);
  };

  if (qty === 0) {
    return (
      <div ref={imageRef} className={isCard ? CARD_SLOT_CLASS : "shrink-0"}>
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding}
          className={
            isCard
              ? "flex h-8 w-full items-center justify-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 text-[11px] font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/20 disabled:opacity-60 sm:h-9 sm:w-auto sm:px-3 sm:text-xs"
              : "btn btn-primary flex-1 !py-3 disabled:opacity-60"
          }
        >
          {adding ? "…" : isCard ? "+ Add" : "Add to Cart"}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={imageRef}
      className={`${isCard ? CARD_SLOT_CLASS : "flex flex-1 shrink-0 items-center gap-1"}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <QtyButton label="Decrease quantity" onClick={handleDecrease} size={isCard ? "sm" : "md"}>
        −
      </QtyButton>
      <span
        className={`text-center font-semibold tabular-nums text-zinc-200 ${
          isCard ? "min-w-5 text-xs sm:w-5" : "min-w-8 text-base"
        }`}
      >
        {qty}
      </span>
      <QtyButton label="Increase quantity" onClick={handleIncrease} size={isCard ? "sm" : "md"}>
        +
      </QtyButton>
    </div>
  );
}

function QtyButton({
  children,
  label,
  onClick,
  size,
}: {
  children: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  size: "sm" | "md";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 font-medium text-zinc-300 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200 ${
        size === "sm" ? "h-8 w-8 text-sm sm:h-9 sm:w-9" : "h-11 w-11 text-lg"
      }`}
    >
      {children}
    </button>
  );
}
