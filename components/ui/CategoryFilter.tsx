"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

const filters: { href: string; label: string; category?: Category }[] = [
  { href: "/shop", label: "All" },
  ...CATEGORIES.map((c) => ({
    href: `/shop/${c.value}`,
    label: c.label,
    category: c.value,
  })),
];

export function CategoryFilter() {
  const pathname = usePathname();

  return (
    <div className="mb-6 grid grid-cols-4 gap-1.5 sm:mb-8 sm:flex sm:flex-wrap sm:gap-2">
      {filters.map((filter) => {
        const isActive =
          filter.href === "/shop"
            ? pathname === "/shop"
            : pathname === filter.href;

        return (
          <Link
            key={filter.href}
            href={filter.href}
            className={`rounded-full px-2 py-1.5 text-center text-[11px] font-medium transition-all sm:px-4 sm:py-2 sm:text-sm ${
              isActive
                ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-cyan-300 ring-1 ring-cyan-500/30"
                : "border border-white/8 bg-white/3 text-zinc-400 hover:border-white/15 hover:bg-white/6 hover:text-zinc-200"
            }`}
          >
            {filter.label}
          </Link>
        );
      })}
    </div>
  );
}
