# Pack & Ship

Animated 3D e-commerce demo where shopping feels like fulfillment. Browse products, add them to your cart, check out, then watch a packing sequence and delivery journey play out in WebGL.

> **Demo only.** Cart and orders live in the browser (`localStorage`). There is no real payment gateway or backend.

---

## Features

- **Shop catalog** — Fruits, electronics, and furniture with category filters and product detail pages
- **3D product previews** — Interactive Three.js models on select products
- **Cart & checkout** — Drawer cart, quantity controls, and a shipping form (persisted locally)
- **Packing animation** — Items assemble into a box with category-aware pack styles (`soft-drop`, `bubble-wrap`, `disassembled`)
- **Order tracking** — Status timeline plus a 3D delivery journey from warehouse to destination
- **Light / dark theme** — Toggle with hydration-safe persistence
- **Motion UI** — Page transitions, scroll reveals, and cart fly animations (Framer Motion + GSAP)

---

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| 3D | Three.js, React Three Fiber, Drei |
| Animation | Framer Motion, GSAP |
| State | Zustand (persisted cart, orders, theme) |

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm**, **yarn**, **pnpm**, or **bun**

---

## Getting started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | Description |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Project structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Home + featured products
│   ├── shop/               # Catalog & category routes
│   ├── product/[slug]/     # Product detail
│   ├── cart/               # Cart page
│   ├── checkout/           # Checkout + processing (packing scene)
│   ├── orders/             # Order history
│   ├── order/[orderId]/    # Single order detail
│   └── track/              # Track-by-order-id form
├── components/
│   ├── ui/                 # Layout, shop, cart, tracking UI
│   └── three/              # WebGL scenes (hero, packing, delivery)
├── data/products.ts        # Product catalog
├── lib/                    # Types, formatters, scene helpers
├── store/                  # Zustand stores (cart, orders, theme)
└── public/
    ├── images/products/    # Product imagery
    └── models/             # GLTF / 3D assets
```

---

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Landing hero + featured products |
| `/shop` | Full catalog |
| `/shop/[category]` | Filtered catalog (`fruit`, `electronics`, `furniture`) |
| `/product/[slug]` | Product detail + 3D preview |
| `/cart` | Cart review |
| `/checkout` | Shipping details |
| `/checkout/processing` | Packing sequence after placing an order |
| `/orders` | Local order history |
| `/order/[orderId]` | Order status, timeline, and 3D tracking |
| `/track` | Look up an order by ID |

---

## How the demo flow works

1. **Browse** products on Home or Shop and open a product page.
2. **Add to cart** — items persist across reloads via Zustand + `localStorage`.
3. **Checkout** — submit shipping info (no real charges).
4. **Processing** — 3D packing sequence runs based on each item’s `packStyle`.
5. **Track** — open the order page or `/track` to follow status and the delivery scene.

Order statuses progress through:

`placed` → `packing` → `packed` → `shipped` → `out_for_delivery` → `delivered`

---

## Data & state

- **Catalog** — static list in `data/products.ts` (`Product` shape in `lib/types.ts`)
- **Cart** — `store/cartStore.ts` (`pack-ship` cart persist key)
- **Orders** — `store/orderStore.ts` with status history and courier metadata
- **Theme** — `store/themeStore.ts` (`light` | `dark`)

To reset the demo, clear site data for localhost (or remove the Zustand keys from Application → Local Storage).

---

## Adding a product

Edit `data/products.ts` and add an entry:

```ts
{
  id: "elec-010",
  slug: "noise-cancelling-headphones",
  name: "Studio Noise-Cancelling Headphones",
  category: "electronics", // "fruit" | "electronics" | "furniture"
  price: 249.0,
  image: "/images/products/your-image.jpg",
  model3d: "/models/your-model.glb", // optional
  description: "Short customer-facing description.",
  packStyle: "bubble-wrap", // "soft-drop" | "bubble-wrap" | "disassembled"
}
```

Place images under `public/images/products/` and optional GLTF/GLB models under `public/models/`.

---

## Notes for contributors

- This project uses a **newer Next.js** than many tutorials. Prefer the docs under `node_modules/next/dist/docs/` when APIs differ from older guides.
- Prefer existing patterns in `components/ui` and `components/three` over new one-off abstractions.
- Keep 3D scenes behind lazy loading / error boundaries (`LazySceneCanvas`, `SceneErrorBoundary`) so non-WebGL environments degrade gracefully.
- Run `npm run lint` before opening a PR.

---

## Deploy

Deploy like any Next.js app. [Vercel](https://vercel.com/new) is the simplest path:

```bash
npm run build
npm run start
```

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for other hosts.

---

## License

Private project — all rights reserved unless otherwise stated.
# Pack---Ship-E-Commerce-Webiste
