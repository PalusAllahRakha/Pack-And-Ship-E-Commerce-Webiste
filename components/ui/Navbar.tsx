"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/track", label: "Track" },
  { href: "/orders", label: "History" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.qty, 0),
  );
  const openDrawer = useCartStore((s) => s.openDrawer);

  if (pathname === "/checkout/processing") return null;

  return (
    <header className="glass-nav sticky top-0 z-30">
      <div className="site-container flex items-center justify-between gap-3 py-3 sm:py-4">
        <Link href="/" className="group flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-bold text-zinc-900">
            P
          </span>
          <span className="truncate text-base font-semibold tracking-tight theme-heading sm:text-lg">
            Pack <span className="gradient-text">&amp; Ship</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`theme-nav-link rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                  isActive ? "theme-nav-link--active" : "hover:bg-[var(--bg-glass-hover)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            type="button"
            id="cart-icon-target"
            onClick={openDrawer}
            className="btn btn-secondary relative !px-3 !py-2"
            aria-label="Open cart"
          >
            <CartIcon />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span
                className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 px-1 text-[10px] font-bold text-zinc-900"
                suppressHydrationWarning
              >
                {count}
              </span>
            )}
          </button>

          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn btn-ghost !p-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t theme-footer md:hidden"
          >
            <div className="site-container flex flex-col gap-1 py-3">
              <div className="flex items-center justify-between border-b theme-footer px-4 py-3 sm:px-6">
                <span className="text-sm font-medium theme-subtext">Menu</span>
                <ThemeToggle />
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="theme-nav-link rounded-lg px-4 py-3 text-sm font-medium hover:bg-[var(--bg-glass-hover)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
