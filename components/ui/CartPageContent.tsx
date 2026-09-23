"use client";

import Image from "next/image";
import Link from "next/link";
import { getProductById } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cartStore";

export function CartPageContent() {
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.subtotal);
  const total = subtotal();

  if (items.length === 0) {
    return (
      <div className="glass-card py-16 text-center">
        <p className="mb-6 text-zinc-400">Your cart is empty.</p>
        <Link href="/shop" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
      <div className="space-y-3 sm:space-y-4 lg:col-span-2">
        {items.map((item) => {
          const product = getProductById(item.productId);
          if (!product) return null;

          return (
            <div
              key={item.productId}
              className="glass-card flex flex-col gap-3 p-3 sm:flex-row sm:gap-4 sm:p-4"
            >
              <div className="flex gap-3 sm:gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-24">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/product/${product.slug}`}
                    className="text-sm font-semibold text-zinc-100 hover:text-cyan-300 sm:text-base"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-zinc-500 sm:text-sm">
                    {formatPrice(product.price)} each
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0 sm:gap-3">
                  <QtyBtn onClick={() => updateQty(item.productId, item.qty - 1)}>−</QtyBtn>
                  <span className="w-6 text-center text-sm text-zinc-300 sm:w-8">{item.qty}</span>
                  <QtyBtn onClick={() => updateQty(item.productId, item.qty + 1)}>+</QtyBtn>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-xs text-rose-400 hover:underline sm:ml-4 sm:text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
              </div>
              <p className="font-semibold gradient-text sm:ml-auto sm:self-center sm:text-right">
                {formatPrice(product.price * item.qty)}
              </p>
            </div>
          );
        })}
        <button
          type="button"
          onClick={clearCart}
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          Clear cart
        </button>
      </div>

      <div className="glass-card h-fit p-4 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">Order Summary</h2>
        <div className="mb-2 flex justify-between text-sm text-zinc-400">
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="mb-2 flex justify-between text-sm text-zinc-400">
          <span>Shipping</span>
          <span className="text-emerald-400">Free</span>
        </div>
        <div className="mb-6 flex justify-between border-t border-white/8 pt-4 text-base font-semibold">
          <span className="text-zinc-200">Total</span>
          <span className="gradient-text">{formatPrice(total)}</span>
        </div>
        <Link href="/checkout" className="btn btn-primary w-full">
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}

function QtyBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm text-zinc-300 hover:bg-white/10"
    >
      {children}
    </button>
  );
}
