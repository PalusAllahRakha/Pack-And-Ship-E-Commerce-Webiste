"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { deliveryProductsFromOrder } from "@/lib/packItemsFromOrder";
import type { Order } from "@/lib/types";
import { resolveAddressType } from "@/lib/deliveryDestination";
import { ORDER_STATUS_LABELS } from "@/lib/orderStatus";
import { LazySceneCanvas } from "@/components/three/LazySceneCanvas";
import type { DeliveryPackProduct } from "@/components/three/DeliveryJourneyScene";

const DeliveryJourneyScene = dynamic(
  () => import("@/components/three/DeliveryJourneyScene"),
  { ssr: false, loading: () => null },
);

interface OrderTracking3DProps {
  order: Order;
  onReachedDestination?: () => void;
  departureCountdown?: number | null;
}

export function OrderTracking3D({
  order,
  onReachedDestination,
  departureCountdown = null,
}: OrderTracking3DProps) {
  const isDelivered = order.status === "delivered";
  const addressType = resolveAddressType(order.shipping);

  const packProducts = useMemo(
    () => deliveryProductsFromOrder(order.items),
    [order.items],
  );

  const destLabel = addressType === "office" ? "Office" : "Home";
  const destIcon = addressType === "office" ? "🏢" : "🏠";

  return (
    <motion.div
      className="glass-card mb-6 overflow-hidden !rounded-2xl"
      animate={
        isDelivered
          ? { boxShadow: "0 0 36px rgba(52, 211, 153, 0.28)" }
          : { boxShadow: "0 0 0 rgba(0,0,0,0)" }
      }
    >
      <div
        className={`tracking-canvas-frame relative mx-auto aspect-[21/9] w-full max-h-[min(42vw,280px)] min-h-[200px] overflow-hidden sm:max-h-[min(38vw,300px)] ${
          isDelivered ? "tracking-canvas-frame--delivered" : ""
        }`}
      >
        <LazySceneCanvas
          className="absolute inset-0 h-full w-full"
          camera={{ position: [0, 2.4, 7.5], fov: 38 }}
          lowPower
        >
          <DeliveryJourneyScene
            status={order.status}
            addressType={addressType}
            packProducts={packProducts}
            onReachedDestination={onReachedDestination}
          />
        </LazySceneCanvas>
        <div className="tracking-scene-overlay pointer-events-none absolute inset-0" />
        <div className="tracking-scene-vignette pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-2 inset-y-2 flex flex-col justify-between sm:inset-x-3 sm:inset-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="tracking-badge tracking-badge--dest">
              <span className="tracking-badge__icon" aria-hidden>
                {destIcon}
              </span>
              <span>{destLabel}</span>
            </div>
            {departureCountdown !== null && departureCountdown > 0 ? (
              <div className="tracking-badge tracking-badge--countdown">
                <span className="tracking-badge__icon" aria-hidden>
                  ⏱
                </span>
                <span>Departs in {departureCountdown}s</span>
              </div>
            ) : (
              <div className="tracking-badge tracking-badge--warehouse">
                <span>Warehouse</span>
                <span className="tracking-badge__icon" aria-hidden>
                  🏭
                </span>
              </div>
            )}
          </div>

          <div className="flex items-end justify-between gap-2">
            <motion.div
              key={order.status}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`tracking-badge max-w-[62%] truncate ${
                isDelivered
                  ? "tracking-badge--status-delivered"
                  : "tracking-badge--status"
              }`}
            >
              {isDelivered ? (
                <>
                  <span className="tracking-badge__icon" aria-hidden>
                    ✓
                  </span>
                  <span>Arrived at destination</span>
                </>
              ) : (
                ORDER_STATUS_LABELS[order.status]
              )}
            </motion.div>
            <div
              className={`tracking-badge shrink-0 ${
                isDelivered ? "tracking-badge--dest" : "tracking-badge--hint"
              }`}
            >
              {isDelivered ? (
                <>
                  <span className="tracking-badge__icon" aria-hidden>
                    {destIcon}
                  </span>
                  <span>At {destLabel}</span>
                </>
              ) : (
                <>
                  <span>En route to {destLabel}</span>
                  <span className="tracking-badge__icon" aria-hidden>
                    →
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
