"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getProductById } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import {
  dedupeStatusHistory,
  formatDeliveryAddress,
  formatTimeShort,
} from "@/lib/orderHistory";
import { useOrderHydrated } from "@/lib/useOrderHydrated";
import { useOrderStore } from "@/store/orderStore";
import type { Order, OrderStatus } from "@/lib/types";
import { OrderDeliveryTimeline } from "@/components/ui/OrderDeliveryTimeline";

type StatusFilter = "all" | "active" | "delivered";

const ACTIVE_STATUSES: OrderStatus[] = [
  "placed",
  "packing",
  "packed",
  "shipped",
  "out_for_delivery",
];

const PAGE_SIZE = 10;

const STATUS_BADGE: Record<OrderStatus, string> = {
  placed: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  packing: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  packed: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  shipped: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  out_for_delivery: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  delivered: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
};

export function DeliveryHistory() {
  const orderHydrated = useOrderHydrated();
  const orders = useOrderStore((s) => s.orders);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const listAnchorRef = useRef<HTMLDivElement>(null);

  const resetListView = () => {
    setVisibleCount(PAGE_SIZE);
    setExpandedId(null);
    requestAnimationFrame(() => {
      const anchor = listAnchorRef.current;
      if (!anchor) return;
      const top = anchor.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    });
  };

  const applyFilter = (value: StatusFilter) => {
    setStatusFilter(value);
    resetListView();
  };

  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered").length;
    return { total: orders.length, delivered, active: orders.length - delivered };
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .filter((order) => {
        if (statusFilter === "delivered" && order.status !== "delivered") {
          return false;
        }
        if (statusFilter === "active" && !ACTIVE_STATUSES.includes(order.status)) {
          return false;
        }
        if (!q) return true;

        const address = formatDeliveryAddress(order).toLowerCase();
        return (
          order.id.toLowerCase().includes(q) ||
          order.shipping.name.toLowerCase().includes(q) ||
          order.shipping.email.toLowerCase().includes(q) ||
          address.includes(q) ||
          (order.courierName?.toLowerCase().includes(q) ?? false)
        );
      });
  }, [orders, query, statusFilter]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  if (!orderHydrated) {
    return (
      <div className="glass-card p-6 text-center text-sm text-zinc-400">
        Loading delivery history…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass-card flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300">
            <strong className="text-zinc-100">{stats.total}</strong> total
          </span>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-cyan-200">
            <strong>{stats.active}</strong> in transit
          </span>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-200">
            <strong>{stats.delivered}</strong> delivered
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetListView();
            }}
            placeholder="Search orders…"
            className="input-field !py-2 text-sm"
            aria-label="Search orders"
          />
          <div
            className="flex shrink-0 gap-1.5"
            role="tablist"
            aria-label="Filter orders by status"
          >
            {(
              [
                ["all", "All"],
                ["active", "Transit"],
                ["delivered", "Done"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={statusFilter === value}
                onClick={() => applyFilter(value)}
                className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === value
                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-100"
                    : "border-white/10 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={listAnchorRef} className="scroll-mt-24" aria-live="polite">
        {filtered.length === 0 ? (
          <motion.div
            key={`empty-${statusFilter}-${query}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="glass-card p-8 text-center"
          >
            <p className="text-sm text-zinc-300">
              {orders.length === 0 ? "No orders yet" : "No matches found"}
            </p>
            {orders.length === 0 && (
              <Link href="/shop" className="btn btn-primary mt-4 text-sm">
                Start Shopping
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`list-${statusFilter}-${query}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            {visible.map((order) => (
              <OrderHistoryCard
                key={order.id}
                order={order}
                expanded={expandedId === order.id}
                onToggle={() =>
                  setExpandedId((id) => (id === order.id ? null : order.id))
                }
              />
            ))}

            {hasMore && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="btn btn-secondary !py-2 text-xs"
                >
                  Load more ({filtered.length - visibleCount})
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function OrderHistoryCard({
  order,
  expanded,
  onToggle,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
}) {
  const products = order.items
    .map((item) => {
      const product = getProductById(item.productId);
      return product ? { name: product.name, qty: item.qty } : null;
    })
    .filter(Boolean) as { name: string; qty: number }[];

  const itemLabel = products
    .map((p) => `${p.name} ×${p.qty}`)
    .join(" · ");

  const timeline = dedupeStatusHistory(order.statusHistory ?? []);

  return (
    <article className="glass-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 p-3 text-left sm:items-center sm:p-3.5"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-zinc-100">
              {order.id}
            </span>
            <span
              className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${STATUS_BADGE[order.status]}`}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className="text-xs font-semibold text-zinc-300">
              {formatPrice(order.total)}
            </span>
          </div>

          <p className="truncate text-sm text-zinc-200">{order.shipping.name}</p>

          <p className="hidden truncate text-[11px] text-zinc-500 sm:block">
            {formatTimeShort(order.createdAt)}
            {order.deliveredAt
              ? ` → ${formatTimeShort(order.deliveredAt)}`
              : " → pending"}
            {order.courierName ? ` · ${order.courierName}` : ""}
          </p>
        </div>

        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="mt-1 shrink-0 text-zinc-500 sm:mt-0"
          aria-hidden
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="border-t border-white/8"
          >
            <div className="space-y-3 p-3 sm:p-3.5">
              <p className="truncate text-[11px] text-zinc-500">
                {order.shipping.email} · {formatDeliveryAddress(order)}
              </p>

              <p className="truncate text-xs text-zinc-400">{itemLabel}</p>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Timeline ({timeline.length} steps)
                </p>
                <Link
                  href={`/order/${order.id}`}
                  className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
                >
                  Live track →
                </Link>
              </div>

              <OrderDeliveryTimeline events={timeline} compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
