"use client";

import { usePathname } from "next/navigation";

export function DemoBanner() {
  const pathname = usePathname();
  const show =
    pathname === "/checkout" || pathname.startsWith("/checkout/");

  if (!show) return null;

  return (
    <div
      className="demo-banner border-b border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-center text-xs text-cyan-200/90"
      role="note"
    >
      Demo store — no real payments or shipments. Enjoy the 3D experience.
    </div>
  );
}
