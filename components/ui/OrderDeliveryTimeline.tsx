"use client";

import type { OrderStatusEvent } from "@/lib/types";
import { ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import { dedupeStatusHistory, formatTimeShort } from "@/lib/orderHistory";

interface OrderDeliveryTimelineProps {
  events: OrderStatusEvent[];
  compact?: boolean;
}

export function OrderDeliveryTimeline({
  events,
  compact = false,
}: OrderDeliveryTimelineProps) {
  const sorted = dedupeStatusHistory(events).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  if (compact) {
    return (
      <ol className="max-h-36 space-y-0 overflow-y-auto pr-1">
        {sorted.map((event, index) => {
          const isLatest = index === 0;
          return (
            <li
              key={event.status}
              className="flex items-center gap-2 border-b border-white/5 py-1.5 last:border-0"
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  isLatest ? "bg-cyan-400" : "bg-zinc-600"
                }`}
              />
              <span className="min-w-0 flex-1 truncate text-xs text-zinc-300">
                {ORDER_STATUS_LABELS[event.status]}
              </span>
              <time
                className="shrink-0 text-[10px] text-zinc-500"
                dateTime={event.timestamp}
              >
                {formatTimeShort(event.timestamp)}
              </time>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="space-y-0">
      {sorted.map((event, index) => {
        const isLatest = index === 0;
        const isDelivered = event.status === "delivered";

        return (
          <li
            key={event.status}
            className="relative flex gap-2.5 pb-3 last:pb-0"
          >
            {index < sorted.length - 1 && (
              <span className="absolute left-[0.35rem] top-3 h-[calc(100%-0.25rem)] w-px bg-white/10" />
            )}
            <span
              className={`relative z-10 mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                isDelivered
                  ? "bg-emerald-400"
                  : isLatest
                    ? "bg-cyan-400"
                    : "bg-zinc-600"
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-xs font-semibold text-zinc-100">
                  {ORDER_STATUS_LABELS[event.status]}
                </p>
                <time className="text-[10px] text-zinc-500" dateTime={event.timestamp}>
                  {formatTimeShort(event.timestamp)}
                </time>
              </div>
              <p className="truncate text-[10px] text-zinc-500">
                {event.actor} · {event.location}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
