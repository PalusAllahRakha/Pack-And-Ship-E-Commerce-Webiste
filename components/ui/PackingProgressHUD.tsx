"use client";

import { motion } from "framer-motion";
import {
  PACKING_STAGES,
  STAGE_LABELS,
  type PackingStage,
} from "@/components/three/PackingSequenceScene";

const STAGE_ICONS: Record<PackingStage, string> = {
  boxErects: "📐",
  itemsEnter: "📦",
  flapsClose: "📋",
  tapeSeal: "📦",
  truckArrives: "🚚",
  doorsOpen: "🚪",
  boxLoads: "📥",
  doorsClose: "🔒",
  truckDeparts: "🛣️",
  deliveryPopup: "✅",
};

interface PackingProgressHUDProps {
  currentStage: PackingStage;
  progress: number;
}

export function PackingProgressHUD({
  currentStage,
  progress,
}: PackingProgressHUDProps) {
  const stageIndex = PACKING_STAGES.indexOf(currentStage);

  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-10 p-4 md:p-6"
      aria-live="polite"
      role="status"
    >
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl md:p-5"
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="text-2xl">{STAGE_ICONS[currentStage]}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-cyan-200">
              {STAGE_LABELS[currentStage]}
            </p>
            <p className="text-xs text-zinc-500">
              Step {Math.min(stageIndex + 1, PACKING_STAGES.length)} of {PACKING_STAGES.length}
            </p>
          </div>
          <span className="text-xs font-medium text-violet-400">{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
