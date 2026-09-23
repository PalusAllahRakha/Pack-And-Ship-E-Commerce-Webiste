import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateOrderId } from "@/lib/orderStatus";
import {
  backfillOrderHistory,
  createStatusEvent,
  dedupeStatusHistory,
  getCourierForOrder,
  normalizeOrders,
  upsertStatusEvent,
} from "@/lib/orderHistory";
import type { CartItem, Order, OrderStatus } from "@/lib/types";

interface CreateOrderInput {
  items: CartItem[];
  total: number;
  shipping: Order["shipping"];
}

interface OrderState {
  orders: Order[];
  createOrder: (input: CreateOrderInput) => Order;
  getOrder: (id: string) => Order | undefined;
  getAllOrders: () => Order[];
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  advanceOrderStatus: (id: string, maxStatus?: OrderStatus) => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],

      createOrder: (input) => {
        const createdAt = new Date().toISOString();
        const id = generateOrderId();
        const courierName = getCourierForOrder(id);

        const draft: Order = {
          id,
          items: input.items,
          total: input.total,
          status: "placed",
          createdAt,
          courierName,
          shipping: input.shipping,
        };

        const placedEvent = createStatusEvent(draft, "placed", createdAt);
        const order: Order = {
          ...draft,
          statusHistory: [placedEvent],
        };

        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },

      getOrder: (id) => get().orders.find((o) => o.id === id),

      getAllOrders: () => get().orders,

      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== id || o.status === status) return o;

            const base = backfillOrderHistory(o);
            const event = createStatusEvent(base, status);

            return {
              ...base,
              status,
              statusHistory: upsertStatusEvent(base.statusHistory ?? [], event),
              deliveredAt: status === "delivered" ? event.timestamp : o.deliveredAt,
            };
          }),
        }));
      },

      advanceOrderStatus: (id, maxStatus = "delivered") => {
        const order = get().getOrder(id);
        if (!order) return;

        const flow: OrderStatus[] = [
          "placed",
          "packing",
          "packed",
          "shipped",
          "out_for_delivery",
          "delivered",
        ];
        const index = flow.indexOf(order.status);
        const maxIndex = flow.indexOf(maxStatus);
        if (index < 0 || index >= flow.length - 1) return;

        const next = flow[index + 1];
        if (flow.indexOf(next) > maxIndex) return;

        get().updateOrderStatus(id, next);
      },
    }),
    {
      name: "pack-ship-orders",
      version: 3,
      migrate: (persisted) => {
        const state = persisted as { orders?: Order[] };
        return {
          orders: normalizeOrders(state.orders ?? []),
        };
      },
    },
  ),
);
