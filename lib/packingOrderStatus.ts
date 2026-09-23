import type { OrderStatus } from "@/lib/types";
import type { PackingStage } from "@/components/three/PackingSequenceScene";
import { ORDER_STATUSES } from "@/lib/orderStatus";

/** Maps packing animation stages to order statuses for the tracking stepper. */
export const PACKING_STAGE_TO_ORDER_STATUS: Partial<Record<PackingStage, OrderStatus>> = {
  boxErects: "packing",
  itemsEnter: "packing",
  flapsClose: "packing",
  tapeSeal: "packed",
  truckArrives: "packed",
  doorsOpen: "packed",
  boxLoads: "packed",
  doorsClose: "packed",
  truckDeparts: "packed",
  deliveryPopup: "shipped",
};

export function orderStatusForPackingStage(stage: PackingStage): OrderStatus | null {
  return PACKING_STAGE_TO_ORDER_STATUS[stage] ?? null;
}

export function applyPackingStageToOrder(
  orderId: string,
  stage: PackingStage,
  updateOrderStatus: (id: string, status: OrderStatus) => void,
  getOrder: (id: string) => { status: OrderStatus } | undefined,
) {
  const target = orderStatusForPackingStage(stage);
  if (!target) return;

  const order = getOrder(orderId);
  if (!order) return;

  const flow: OrderStatus[] = [
    "placed",
    "packing",
    "packed",
    "shipped",
    "out_for_delivery",
    "delivered",
  ];
  const currentIdx = flow.indexOf(order.status);
  const targetIdx = flow.indexOf(target);
  if (targetIdx > currentIdx) {
    updateOrderStatus(orderId, target);
  }
}

export function isPackingAnimationComplete(status: OrderStatus): boolean {
  const shippedIdx = ORDER_STATUSES.indexOf("shipped");
  const statusIdx = ORDER_STATUSES.indexOf(status);
  return statusIdx >= shippedIdx && statusIdx >= 0;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}
