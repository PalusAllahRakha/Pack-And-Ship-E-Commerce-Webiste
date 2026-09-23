"use client";

import { motion } from "framer-motion";
import type { Order } from "@/lib/types";
import {
  ORDER_STATUSES,
  ORDER_STATUS_DESCRIPTIONS,
  ORDER_STATUS_LABELS,
} from "@/lib/orderStatus";

interface OrderStepperProps {
  status: Order["status"];
  orientation?: "horizontal" | "vertical";
}

export function OrderStepper({
  status,
  orientation = "horizontal",
}: OrderStepperProps) {
  const currentIndex = ORDER_STATUSES.indexOf(status);
  const isVertical = orientation === "vertical";
  const stepCount = ORDER_STATUSES.length;

  return (
    <ol
      className={
        isVertical
          ? "space-y-0"
          : "relative flex w-full"
      }
    >
      {ORDER_STATUSES.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <li
            key={step}
            className={
              isVertical
                ? "relative flex gap-4 pb-8 last:pb-0"
                : "relative z-10 flex min-w-0 flex-1 flex-col items-center text-center"
            }
          >
            {!isVertical && index < stepCount - 1 && (
              <div
                className="pointer-events-none absolute left-1/2 top-5 z-0 hidden h-0.5 w-full -translate-y-1/2 md:block"
                aria-hidden
              >
                <div className="h-full rounded-full bg-white/10" />
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                  initial={false}
                  animate={{ width: index < currentIndex ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            )}

            {isVertical && index < stepCount - 1 && (
              <div className="absolute left-5 top-10 h-[calc(100%-2.5rem)] w-0.5 -translate-x-1/2 overflow-hidden bg-white/10">
                <motion.div
                  className="w-full bg-gradient-to-b from-cyan-400 to-emerald-400"
                  initial={false}
                  animate={{ height: isComplete ? "100%" : "0%" }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}

            <motion.div
              initial={false}
              animate={{
                scale: isCurrent ? 1.06 : 1,
                boxShadow: isCurrent
                  ? "0 0 16px rgba(34, 211, 238, 0.35)"
                  : "0 0 0 rgba(0,0,0,0)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-2 ${
                isComplete
                  ? "bg-gradient-to-br from-cyan-400 to-violet-500 text-zinc-900 ring-cyan-400/30"
                  : isCurrent
                    ? "bg-[#0c0c14] text-cyan-300 ring-cyan-400/50"
                    : "bg-[#0c0c14] text-zinc-600 ring-white/10"
              }`}
            >
              {isComplete ? (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  ✓
                </motion.span>
              ) : (
                index + 1
              )}
            </motion.div>

            <div className={isVertical ? "pt-1" : "mt-3 px-0.5"}>
              <p
                className={`text-xs font-semibold leading-tight sm:text-sm ${
                  isCurrent
                    ? "text-cyan-300"
                    : isComplete
                      ? "text-zinc-200"
                      : "text-zinc-600"
                }`}
              >
                {ORDER_STATUS_LABELS[step]}
              </p>
              {(isCurrent || isComplete) && !isUpcoming && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className={`mt-1 text-xs text-zinc-500 ${isCurrent ? "block" : "hidden sm:block"}`}
                >
                  {ORDER_STATUS_DESCRIPTIONS[step]}
                </motion.p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
