"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { packItemsFromOrder } from "@/lib/packItemsFromOrder";
import {
  applyPackingStageToOrder,
  isPackingAnimationComplete,
} from "@/lib/packingOrderStatus";
import { LazySceneCanvas } from "@/components/three/LazySceneCanvas";
import { PackingProgressHUD } from "@/components/ui/PackingProgressHUD";
import {
  PACKING_STAGES,
  type PackingSequenceHandle,
  type PackingStage,
} from "@/components/three/PackingSequenceScene";
import { useOrderHydrated } from "@/lib/useOrderHydrated";
import { useOrderStore } from "@/store/orderStore";

const PackingSequenceScene = dynamic(
  () => import("@/components/three/PackingSequenceScene"),
  { ssr: false, loading: () => null },
);

export function ProcessingPageContent() {
  const orderHydrated = useOrderHydrated();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const order = useOrderStore((s) =>
    orderId ? s.orders.find((o) => o.id === orderId) : undefined,
  );
  const getOrder = useOrderStore((s) => s.getOrder);
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);

  const sequenceRef = useRef<PackingSequenceHandle>(null);
  const mountCheckedRef = useRef(false);
  const [currentStage, setCurrentStage] = useState<PackingStage>("boxErects");
  const [progress, setProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [skipAnimation, setSkipAnimation] = useState(false);

  const packItems = useMemo(() => {
    if (!order?.items.length) return [];
    return packItemsFromOrder(order.items);
  }, [order]);

  const packSceneKey = useMemo(
    () =>
      packItems
        .map((item, index) => `${index}:${item.slug}:${item.packStyle}`)
        .join("|"),
    [packItems],
  );

  const itemCount = packItems.length;

  const handleComplete = () => {
    if (showPopup) return;
    if (orderId) {
      updateOrderStatus(orderId, "shipped");
    }
    setShowPopup(true);
    setProgress(1);
    setCurrentStage("deliveryPopup");
  };

  const handleStageChange = (stage: PackingStage) => {
    setCurrentStage(stage);
    const idx = PACKING_STAGES.indexOf(stage);
    setProgress(Math.max(0.05, (idx + 1) / PACKING_STAGES.length));

    if (orderId) {
      applyPackingStageToOrder(
        orderId,
        stage,
        updateOrderStatus,
        (id) => getOrder(id),
      );
    }
  };

  const handleSkip = () => {
    sequenceRef.current?.skip();
    if (orderId) updateOrderStatus(orderId, "shipped");
    setShowPopup(true);
    setProgress(1);
    setCurrentStage("deliveryPopup");
  };

  useEffect(() => {
    if (!orderHydrated || !order || mountCheckedRef.current) return;
    mountCheckedRef.current = true;

    const replay = isPackingAnimationComplete(order.status);
    setSkipAnimation(replay);
    if (replay) {
      setShowPopup(true);
      setProgress(1);
      setCurrentStage("deliveryPopup");
    }
  }, [orderHydrated, order]);

  useEffect(() => {
    if (!orderHydrated || !order || skipAnimation) {
      setCanvasReady(false);
      return;
    }
    const id = window.setTimeout(() => setCanvasReady(true), 600);
    return () => {
      window.clearTimeout(id);
      setCanvasReady(false);
    };
  }, [orderHydrated, order?.id, skipAnimation]);

  useEffect(() => {
    if (orderId && order?.status === "placed") {
      updateOrderStatus(orderId, "packing");
    }
  }, [orderId, order?.status, updateOrderStatus]);

  if (!orderHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070d]">
        <div className="glass-card p-10 text-center">
          <p className="text-zinc-400">Loading order…</p>
        </div>
      </div>
    );
  }

  if (!orderId || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07070d]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-10 text-center"
        >
          <p className="mb-4 text-zinc-400">No order found for processing.</p>
          <Link href="/checkout" className="btn btn-primary">
            Return to Checkout
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#07070d]">
      {skipAnimation && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-950/25 via-[#07070d] to-violet-950/20" />
      )}

      {!skipAnimation && (
        <>
          <div className="pointer-events-none absolute inset-0 z-[5] shadow-[inset_0_0_120px_rgba(0,0,0,0.65)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-16 bg-gradient-to-b from-black/50 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-24 bg-gradient-to-t from-black/60 to-transparent" />

          <PackingProgressHUD currentStage={currentStage} progress={progress} />

          <motion.button
            type="button"
            onClick={handleSkip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-3 top-20 z-20 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/10 sm:right-6 sm:top-24 sm:px-4 sm:py-2 sm:text-sm"
          >
            Skip Animation
          </motion.button>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            {!canvasReady ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#07070d]/92">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
                <p className="text-[10px] font-medium text-zinc-500 sm:text-xs">
                  Preparing 3D packing scene…
                </p>
              </div>
            ) : (
              <LazySceneCanvas
                className="absolute inset-0 h-full w-full"
                camera={{ position: [0, 2.4, 7.5], fov: 42 }}
                lowPower
                fallback={
                  <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                    <p className="text-sm text-zinc-400">
                      3D packing preview unavailable. Your order is still being processed.
                    </p>
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-2.5 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20"
                    >
                      Continue to confirmation
                    </button>
                  </div>
                }
              >
                <PackingSequenceScene
                  key={packSceneKey}
                  ref={sequenceRef}
                  packItems={packItems}
                  onComplete={handleComplete}
                  onStageChange={handleStageChange}
                />
              </LazySceneCanvas>
            )}
          </div>

          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute bottom-6 left-0 right-0 z-10 px-4 text-center sm:bottom-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
              Order {orderId}
            </p>
            <p className="mt-1 text-sm font-medium text-white/90">
              {itemCount > 0
                ? `Packing ${itemCount} item${itemCount === 1 ? "" : "s"} for your order`
                : "Watch your package come to life"}
            </p>
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {showPopup && (
          <OrderShippedModal orderId={orderId} revisit={skipAnimation} />
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderShippedModal({
  orderId,
  revisit = false,
}: {
  orderId: string;
  revisit?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-6 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="glass-card w-full max-w-md p-6 text-center !border-cyan-500/20 sm:p-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: revisit ? 0 : 0.2, type: "spring", stiffness: 400 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-3xl"
        >
          {revisit ? "📦" : "🎉"}
        </motion.div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
          {orderId}
        </p>
        <h2 className="mb-2 text-2xl font-bold text-zinc-50">
          {revisit ? "Already Shipped!" : "Order Packed & On Its Way!"}
        </h2>
        <p className="mb-6 text-sm text-zinc-400">
          {revisit
            ? "This order finished packing earlier — pick up tracking or keep shopping."
            : "Your package has been sealed, loaded, and is heading out for delivery."}
        </p>
        {!revisit && (
          <>
            <div className="mb-2 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "75%" }}
                transition={{ delay: 0.4, duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
              />
            </div>
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Status: Shipped
            </p>
          </>
        )}
        {revisit && (
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Status: Shipped
          </p>
        )}
        <Link href={`/order/${orderId}`} className="btn btn-primary mb-3 w-full !py-3">
          Track Your Order →
        </Link>
        <Link href="/shop" className="btn btn-secondary w-full !py-3">
          Continue Shopping
        </Link>
      </motion.div>
    </motion.div>
  );
}
