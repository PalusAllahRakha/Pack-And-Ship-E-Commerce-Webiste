import type { Order, OrderStatus, OrderStatusEvent } from "@/lib/types";
import { ORDER_STATUSES } from "@/lib/orderStatus";

const WAREHOUSE = "Pack & Ship Warehouse, Main Hub";

const COURIERS = [
  "Jordan Lee",
  "Sam Rivera",
  "Alex Chen",
  "Morgan Blake",
  "Riley Santos",
];

export function getCourierForOrder(orderId: string): string {
  let hash = 0;
  for (const char of orderId) {
    hash = (hash + char.charCodeAt(0)) % COURIERS.length;
  }
  return COURIERS[hash];
}

export function formatDeliveryAddress(order: Pick<Order, "shipping">): string {
  const { address, city, zip } = order.shipping;
  return `${address}, ${city} ${zip}`;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function dedupeStatusHistory(events: OrderStatusEvent[]): OrderStatusEvent[] {
  const latest = new Map<OrderStatus, OrderStatusEvent>();
  for (const event of events) {
    const prev = latest.get(event.status);
    if (!prev || new Date(event.timestamp) >= new Date(prev.timestamp)) {
      latest.set(event.status, event);
    }
  }
  return ORDER_STATUSES.filter((s) => latest.has(s)).map((s) => latest.get(s)!);
}

export function upsertStatusEvent(
  history: OrderStatusEvent[],
  event: OrderStatusEvent,
): OrderStatusEvent[] {
  return dedupeStatusHistory([...history, event]);
}

export function formatTimeShort(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function createStatusEvent(
  order: Order,
  status: OrderStatus,
  timestamp: string = new Date().toISOString(),
): OrderStatusEvent {
  const destination = formatDeliveryAddress(order);
  const courier = order.courierName ?? getCourierForOrder(order.id);
  const customer = order.shipping.name;

  const events: Record<OrderStatus, OrderStatusEvent> = {
    placed: {
      status,
      timestamp,
      location: destination,
      actor: customer,
      note: "Customer placed order",
    },
    packing: {
      status,
      timestamp,
      location: WAREHOUSE,
      actor: "Warehouse Team",
      note: "Items picked and packing started",
    },
    packed: {
      status,
      timestamp,
      location: WAREHOUSE,
      actor: "Warehouse Team",
      note: "Box sealed and labeled",
    },
    shipped: {
      status,
      timestamp,
      location: WAREHOUSE,
      actor: courier,
      note: "Package left warehouse",
    },
    out_for_delivery: {
      status,
      timestamp,
      location: `En route · ${order.shipping.city}`,
      actor: courier,
      note: `Driver assigned · heading to ${customer}`,
    },
    delivered: {
      status,
      timestamp,
      location: destination,
      actor: courier,
      note: `Delivered to ${customer}`,
    },
  };

  return events[status];
}

export function backfillOrderHistory(order: Order): Order {
  const courierName = order.courierName ?? getCourierForOrder(order.id);

  if (order.statusHistory && order.statusHistory.length > 0) {
    const statusHistory = dedupeStatusHistory(order.statusHistory);
    return {
      ...order,
      courierName,
      statusHistory,
    };
  }

  const withCourier = { ...order, courierName };
  const lastIndex = ORDER_STATUSES.indexOf(order.status);
  const base = new Date(order.createdAt).getTime();
  const stepMs = 5 * 60 * 1000;

  const statusHistory = ORDER_STATUSES.slice(0, lastIndex + 1).map((status, index) =>
    createStatusEvent(
      withCourier,
      status,
      new Date(base + index * stepMs).toISOString(),
    ),
  );

  return {
    ...withCourier,
    statusHistory,
    deliveredAt:
      order.deliveredAt ??
      (order.status === "delivered"
        ? statusHistory[statusHistory.length - 1]?.timestamp
        : undefined),
  };
}

export function normalizeOrders(orders: Order[]): Order[] {
  return orders.map((order) => {
    const normalized = backfillOrderHistory(order);
    return {
      ...normalized,
      statusHistory: dedupeStatusHistory(normalized.statusHistory ?? []),
    };
  });
}
