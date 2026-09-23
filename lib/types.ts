export type Category = "fruit" | "electronics" | "furniture";

export type PackStyle = "soft-drop" | "bubble-wrap" | "disassembled";

export type AddressType = "home" | "office";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  image: string;
  model3d?: string;
  description: string;
  packStyle: PackStyle;
}

export interface CartItem {
  productId: string;
  qty: number;
}

export type OrderStatus =
  | "placed"
  | "packing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered";

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: string;
  location: string;
  actor: string;
  note: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  deliveredAt?: string;
  courierName?: string;
  statusHistory?: OrderStatusEvent[];
  shipping: {
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    addressType: AddressType;
  };
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "fruit", label: "Fruits" },
  { value: "electronics", label: "Electronics" },
  { value: "furniture", label: "Furniture" },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  fruit: "Fruits",
  electronics: "Electronics",
  furniture: "Furniture",
};

export function isCategory(value: string): value is Category {
  return value === "fruit" || value === "electronics" || value === "furniture";
}
