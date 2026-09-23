import type { Product } from "@/lib/types";

export const products: Product[] = [
  {
    id: "fruit-001",
    slug: "honeycrisp-apples",
    name: "Honeycrisp Apples (6-pack)",
    category: "fruit",
    price: 8.99,
    image: "/images/products/honeycrisp-apples.jpg",
    description:
      "Crisp, sweet Honeycrisp apples picked at peak ripeness. Perfect for snacking or baking.",
    packStyle: "soft-drop",
  },
  {
    id: "fruit-002",
    slug: "organic-bananas",
    name: "Organic Bananas (bunch)",
    category: "fruit",
    price: 3.49,
    image: "/images/products/organic-bananas.jpg",
    description:
      "Naturally ripened organic bananas with creamy texture and balanced sweetness.",
    packStyle: "soft-drop",
  },
  {
    id: "fruit-003",
    slug: "strawberry-pint",
    name: "Fresh Strawberries (pint)",
    category: "fruit",
    price: 5.99,
    image: "/images/products/strawberry-pint.jpg",
    description:
      "Juicy, ruby-red strawberries — ideal for desserts, smoothies, or eating fresh.",
    packStyle: "soft-drop",
  },
  {
    id: "fruit-004",
    slug: "mango-trio",
    name: "Champagne Mangoes (3-pack)",
    category: "fruit",
    price: 7.49,
    image: "/images/products/mango-trio.jpg",
    description:
      "Fragrant champagne mangoes with silky flesh and tropical flavor.",
    packStyle: "soft-drop",
  },
  {
    id: "fruit-005",
    slug: "blueberry-clamshell",
    name: "Blueberries (clamshell)",
    category: "fruit",
    price: 6.29,
    image: "/images/products/blueberry-clamshell.jpg",
    description:
      "Plump, antioxidant-rich blueberries — great for breakfast bowls and baking.",
    packStyle: "soft-drop",
  },
  {
    id: "elec-001",
    slug: "wireless-earbuds",
    name: "Aura Wireless Earbuds",
    category: "electronics",
    price: 79.99,
    image: "/images/products/wireless-earbuds.jpg",
    description:
      "Active noise cancellation, 32-hour battery life, and crystal-clear calls.",
    packStyle: "bubble-wrap",
  },
  {
    id: "elec-002",
    slug: "smart-watch",
    name: "Pulse Smart Watch",
    category: "electronics",
    price: 199.0,
    image: "/images/products/smart-watch.jpg",
    description:
      "Health tracking, GPS, and a vibrant AMOLED display in a slim aluminum body.",
    packStyle: "bubble-wrap",
  },
  {
    id: "elec-003",
    slug: "portable-speaker",
    name: "Boom Mini Speaker",
    category: "electronics",
    price: 49.99,
    image: "/images/products/portable-speaker.jpg",
    description:
      "Waterproof Bluetooth speaker with 360° sound and 12-hour playtime.",
    packStyle: "bubble-wrap",
  },
  {
    id: "elec-004",
    slug: "mechanical-keyboard",
    name: "Click Pro Keyboard",
    category: "electronics",
    price: 129.0,
    image: "/images/products/mechanical-keyboard.jpg",
    description:
      "Hot-swappable switches, per-key RGB, and a solid aluminum frame.",
    packStyle: "bubble-wrap",
  },
  {
    id: "elec-005",
    slug: "usb-c-hub",
    name: "Connect 7-in-1 USB-C Hub",
    category: "electronics",
    price: 39.99,
    image: "/images/products/usb-c-hub.jpg",
    description:
      "HDMI, SD card, and fast USB ports in a compact travel-friendly hub.",
    packStyle: "bubble-wrap",
  },
  {
    id: "furn-001",
    slug: "oak-bookshelf",
    name: "Oak Ladder Bookshelf",
    category: "furniture",
    price: 249.0,
    image: "/images/products/oak-bookshelf.jpg",
    description:
      "Five-tier solid oak bookshelf with a modern leaning silhouette.",
    packStyle: "disassembled",
  },
  {
    id: "furn-002",
    slug: "ergonomic-chair",
    name: "Flow Ergonomic Chair",
    category: "furniture",
    price: 399.0,
    image: "/images/products/ergonomic-chair.jpg",
    description:
      "Adjustable lumbar support, breathable mesh, and smooth tilt mechanism.",
    packStyle: "disassembled",
  },
  {
    id: "furn-003",
    slug: "coffee-table",
    name: "Nordic Coffee Table",
    category: "furniture",
    price: 179.0,
    image: "/images/products/coffee-table.jpg",
    description:
      "Minimal walnut coffee table with rounded edges and hidden storage.",
    packStyle: "disassembled",
  },
  {
    id: "furn-004",
    slug: "desk-lamp",
    name: "Arc Desk Lamp",
    category: "furniture",
    price: 59.0,
    image: "/images/products/desk-lamp.jpg",
    description:
      "Adjustable LED desk lamp with warm-to-cool color temperature control.",
    packStyle: "disassembled",
  },
  {
    id: "furn-005",
    slug: "floor-plant-stand",
    name: "Bamboo Plant Stand",
    category: "furniture",
    price: 45.0,
    image: "/images/products/floor-plant-stand.jpg",
    description:
      "Tiered bamboo stand for indoor plants — flat-pack friendly assembly.",
    packStyle: "disassembled",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);
}

export function searchProducts(
  list: Product[],
  query: string,
): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q),
  );
}

export type ProductSort = "name" | "price-asc" | "price-desc";

export function sortProducts(list: Product[], sort: ProductSort): Product[] {
  const copy = [...list];
  if (sort === "price-asc") return copy.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return copy.sort((a, b) => b.price - a.price);
  return copy.sort((a, b) => a.name.localeCompare(b.name));
}
