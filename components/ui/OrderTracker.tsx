"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getProductById } from "@/data/products";
import { formatPrice } from "@/lib/format";
import {
  ORDER_STATUS_LABELS,
  READY_TO_SHIP_STATUSES,
  TRACKING_DELIVERY_START_DELAY_MS,
} from "@/lib/orderStatus";
import { formatDateTime } from "@/lib/orderHistory";
import { resolveAddressType } from "@/lib/deliveryDestination";
import { useOrderHydrated } from "@/lib/useOrderHydrated";
import { useOrderStore } from "@/store/orderStore";
import { OrderDeliveryTimeline } from "@/components/ui/OrderDeliveryTimeline";
import { OrderStepper } from "@/components/ui/OrderStepper";
import { OrderTracking3D } from "@/components/ui/OrderTracking3D";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface OrderTrackerProps {
  orderId: string;
}

export function OrderTracker({ orderId }: OrderTrackerProps) {
  const orderHydrated = useOrderHydrated();
  const order = useOrderStore((s) => s.orders.find((o) => o.id === orderId));
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);
  const [deliveryCountdown, setDeliveryCountdown] = useState<number | null>(null);

  const handleReachedDestination = useCallback(() => {
    updateOrderStatus(orderId, "delivered");
  }, [orderId, updateOrderStatus]);

  const orderStatus = order?.status;

  // Ready to ship → wait 5s → start out-for-delivery animation
  useEffect(() => {
    if (
      !orderStatus ||
      !(READY_TO_SHIP_STATUSES as readonly string[]).includes(orderStatus)
    ) {
      setDeliveryCountdown(null);
      return;
    }

    const endsAt = Date.now() + TRACKING_DELIVERY_START_DELAY_MS;
    setDeliveryCountdown(Math.ceil(TRACKING_DELIVERY_START_DELAY_MS / 1000));

    const countdown = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setDeliveryCountdown(left > 0 ? left : null);
    }, 250);

    const startDelivery = setTimeout(() => {
      updateOrderStatus(orderId, "out_for_delivery");
      setDeliveryCountdown(null);
    }, TRACKING_DELIVERY_START_DELAY_MS);

    return () => {
      clearTimeout(startDelivery);
      clearInterval(countdown);
    };
  }, [orderStatus, orderId, updateOrderStatus]);

  if (!orderHydrated) {
    return (
      <div className="glass-card p-10 text-center">
        <p className="text-zinc-400">Loading order…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <ScrollReveal>
        <div className="glass-card p-10 text-center">
          <p className="mb-4 text-zinc-400">
            Order <strong className="text-zinc-200">{orderId}</strong> not found.
          </p>
          <Link href="/shop" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </ScrollReveal>
    );
  }

  const isDelivered = order.status === "delivered";
  const isWaitingToDispatch =
    deliveryCountdown !== null &&
    (READY_TO_SHIP_STATUSES as readonly string[]).includes(order.status);
  const progress =
    ["placed", "packing", "packed", "shipped", "out_for_delivery", "delivered"].indexOf(
      order.status,
    ) / 5;

  return (
    <div className="relative space-y-6">
      {isWaitingToDispatch && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-center sm:p-5"
        >
          <p className="text-sm font-semibold text-cyan-200">Package ready to ship</p>
          <p className="mt-1 text-xs text-zinc-400">
            Driver departs in {deliveryCountdown}s…
          </p>
        </motion.div>
      )}

      {isDelivered && (
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-violet-500/15 p-4 text-center sm:p-6"
        >
          <h2 className="text-lg font-bold text-emerald-200 sm:text-xl">Package Delivered!</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {order.courierName
              ? `Delivered by ${order.courierName}`
              : "Truck arrived at the destination marker."}
          </p>
        </motion.div>
      )}

      <OrderTracking3D
        order={order}
        onReachedDestination={handleReachedDestination}
        departureCountdown={deliveryCountdown}
      />

      <ScrollReveal>
        <motion.div
          className="glass-card relative overflow-hidden p-4 sm:p-6 md:p-8"
          animate={isDelivered ? { borderColor: "rgba(52, 211, 153, 0.4)" } : {}}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-label mb-1">Order ID</p>
              <p className="text-lg font-bold text-zinc-50 sm:text-2xl">{order.id}</p>
            </div>
            <motion.div
              key={order.status}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                isDelivered
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                  : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
              }`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </motion.div>
          </div>

          <div className="mb-8 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400"
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          <div className="hidden md:block">
            <OrderStepper status={order.status} orientation="horizontal" />
          </div>
          <div className="md:hidden">
            <OrderStepper status={order.status} orientation="vertical" />
          </div>
        </motion.div>
      </ScrollReveal>

      <div className="grid gap-6 lg:grid-cols-2">
        <ScrollReveal delay={0.1}>
          <section className="glass-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-100">Items</h2>
            <ul className="space-y-3">
              {order.items.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;
                return (
                  <li key={item.productId} className="flex justify-between text-sm">
                    <span className="text-zinc-400">
                      {product.name} × {item.qty}
                    </span>
                    <span className="font-medium text-zinc-200">
                      {formatPrice(product.price * item.qty)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 border-t border-white/8 pt-4 font-semibold gradient-text">
              Total: {formatPrice(order.total)}
            </p>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <section className="glass-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-100">Delivery</h2>
            <p className="text-sm text-zinc-300">{order.shipping.name}</p>
            <p className="text-sm text-zinc-400">{order.shipping.email}</p>
            <p className="mt-2 text-sm text-zinc-400">
              {order.shipping.address}, {order.shipping.city} {order.shipping.zip}
            </p>
            <p className="mt-1 text-xs text-cyan-400/80">
              {resolveAddressType(order.shipping) === "office" ? "Office delivery" : "Home delivery"}
            </p>
            {isDelivered && order.deliveredAt && (
              <p className="mt-2 text-xs text-emerald-400/90">
                Delivered {formatDateTime(order.deliveredAt)}
                {order.courierName ? ` · ${order.courierName}` : ""}
              </p>
            )}
            {isDelivered && (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="btn btn-primary flex-1 text-center">
                  Continue Shopping
                </Link>
              </div>
            )}
          </section>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.15}>
        <section className="glass-card p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-zinc-100">Delivery history</h2>
            <Link href="/orders" className="text-xs font-medium text-cyan-400 hover:text-cyan-300">
              All orders →
            </Link>
          </div>
          <OrderDeliveryTimeline events={order.statusHistory ?? []} />
        </section>
      </ScrollReveal>
    </div>
  );
}
