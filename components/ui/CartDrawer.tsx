"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getProductById } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cartStore";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isDrawerOpen);
  const items = useCartStore((s) => s.items);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal);
  const total = subtotal();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            className="cart-overlay fixed inset-0 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="cart-drawer fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l shadow-2xl backdrop-blur-xl sm:max-w-sm md:max-w-md"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="theme-divider flex items-center justify-between border-b px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <h2 className="theme-heading text-lg font-semibold">Your Cart</h2>
                <p className="theme-muted text-xs">{items.length} item(s)</p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <p className="mb-2 text-4xl">🛒</p>
                  <p className="text-zinc-400">Your cart is empty</p>
                  <Link
                    href="/shop"
                    onClick={closeDrawer}
                    className="btn btn-secondary mt-6"
                  >
                    Browse Shop
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => {
                    const product = getProductById(item.productId);
                    if (!product) return null;

                    return (
                      <li
                        key={item.productId}
                        className="glass-card flex gap-4 !rounded-xl p-3"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <Link
                            href={`/product/${product.slug}`}
                            onClick={closeDrawer}
                            className="font-medium text-zinc-100 hover:text-cyan-300"
                          >
                            {product.name}
                          </Link>
                          <p className="text-sm text-zinc-500">
                            {formatPrice(product.price)}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <QtyButton
                              label="Decrease"
                              onClick={() =>
                                updateQty(item.productId, item.qty - 1)
                              }
                            >
                              −
                            </QtyButton>
                            <span className="w-6 text-center text-sm text-zinc-300">
                              {item.qty}
                            </span>
                            <QtyButton
                              label="Increase"
                              onClick={() =>
                                updateQty(item.productId, item.qty + 1)
                              }
                            >
                              +
                            </QtyButton>
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="ml-auto text-xs text-rose-400 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="theme-divider border-t px-4 py-4 sm:px-6 sm:py-5">
                <div className="theme-heading mb-4 flex justify-between text-base font-semibold">
                  <span>Subtotal</span>
                  <span className="gradient-text">{formatPrice(total)}</span>
                </div>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="btn btn-secondary mb-2 w-full"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="btn btn-primary w-full"
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function QtyButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm text-zinc-300 transition-colors hover:bg-white/10"
    >
      {children}
    </button>
  );
}
