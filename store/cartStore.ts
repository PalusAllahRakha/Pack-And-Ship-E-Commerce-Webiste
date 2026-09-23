import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProductById } from "@/data/products";
import type { CartItem } from "@/lib/types";

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (productId: string, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (productId, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId
                  ? { ...i, qty: i.qty + qty }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { productId, qty }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQty: (productId, qty) => {
        if (qty < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, qty } : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.qty, 0),

      subtotal: () =>
        get().items.reduce((sum, item) => {
          const product = getProductById(item.productId);
          return sum + (product?.price ?? 0) * item.qty;
        }, 0),
    }),
    { name: "pack-ship-cart" },
  ),
);
