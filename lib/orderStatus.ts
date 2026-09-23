import type { Order } from "@/lib/types";

export const ORDER_STATUSES = [
  "placed",
  "packing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export const ORDER_STATUS_LABELS: Record<Order["status"], string> = {
  placed: "Order Placed",
  packing: "Packing",
  packed: "Packed & Sealed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export const ORDER_STATUS_DESCRIPTIONS: Record<Order["status"], string> = {
  placed: "We received your order and are getting things ready.",
  packing: "Your items are being carefully placed in the box.",
  packed: "Box sealed and taped — ready for pickup.",
  shipped: "Your package left our warehouse.",
  out_for_delivery: "The driver is on the way to your address.",
  delivered: "Package delivered. Enjoy!",
};

// Delay on the tracking page before the truck leaves (packed/shipped → out for delivery).
export const TRACKING_DELIVERY_START_DELAY_MS = 5000;

export const READY_TO_SHIP_STATUSES = ["packed", "shipped"] as const;

export function getNextStatus(
  status: Order["status"],
): Order["status"] | null {
  const index = ORDER_STATUSES.indexOf(status);
  if (index < 0 || index >= ORDER_STATUSES.length - 1) return null;
  return ORDER_STATUSES[index + 1];
}

export function generateOrderId(): string {
  const segment = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${segment}`;
}
