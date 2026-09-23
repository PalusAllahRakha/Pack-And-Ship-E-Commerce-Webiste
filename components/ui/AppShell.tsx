"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { DemoBanner } from "@/components/ui/DemoBanner";
import { Footer } from "@/components/ui/Footer";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { PageTransition } from "@/components/ui/PageTransition";
import { useCartStore } from "@/store/cartStore";
import { preloadPackingModels } from "@/lib/models";

const CartDrawer = dynamic(
  () => import("@/components/ui/CartDrawer").then((m) => ({ default: m.CartDrawer })),
  { ssr: false },
);

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isProcessing = pathname === "/checkout/processing";
  const cartItems = useCartStore((s) => s.items);

  useEffect(() => {
    if (isProcessing || cartItems.length === 0) return;
    preloadPackingModels();
  }, [cartItems.length, isProcessing]);

  return (
    <>
      <AmbientBackground />
      <div className="relative flex min-h-full flex-1 flex-col">
        <Navbar />
        <DemoBanner />
        <PageTransition>{children}</PageTransition>
        {!isProcessing && <Footer />}
        <CartDrawer />
      </div>
    </>
  );
}
