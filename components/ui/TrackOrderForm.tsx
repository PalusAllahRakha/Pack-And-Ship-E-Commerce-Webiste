"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useOrderHydrated } from "@/lib/useOrderHydrated";
import { useOrderStore } from "@/store/orderStore";

export function TrackOrderForm() {
  const router = useRouter();
  const orderHydrated = useOrderHydrated();
  const getOrder = useOrderStore((s) => s.getOrder);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim().toUpperCase();
    if (!trimmed) {
      setError("Enter your order ID.");
      return;
    }

    if (!orderHydrated) {
      setError("Orders are still loading. Try again in a moment.");
      return;
    }

    const order = getOrder(trimmed);
    if (!order) {
      setError("Order not found. Check the ID or view your order history.");
      return;
    }

    setError("");
    router.push(`/order/${encodeURIComponent(order.id)}`);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass-card w-full max-w-lg p-4 sm:p-6"
    >
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-400">
          Order ID
        </span>
        <input
          type="text"
          value={orderId}
          onChange={(e) => {
            setOrderId(e.target.value);
            if (error) setError("");
          }}
          placeholder="e.g. ORD-A1B2C3"
          className="input-field"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "track-order-error" : undefined}
        />
      </label>
      {error && (
        <p id="track-order-error" className="mt-2 text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" className="btn btn-primary w-full sm:w-auto">
          Track Order
        </button>
        <Link href="/orders" className="text-center text-sm text-cyan-400 hover:text-cyan-300">
          View order history
        </Link>
      </div>
    </motion.form>
  );
}
