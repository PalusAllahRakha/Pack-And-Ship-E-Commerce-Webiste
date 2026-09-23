"use client";

import { useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  cardBrand,
  displayCardName,
  displayCardNumber,
  displayCvv,
  displayExpiry,
} from "@/lib/cardFormat";

export interface PaymentCardFields {
  name: string;
  cardName: string;
  card: string;
  expiry: string;
  cvv: string;
}

interface AnimatedPaymentCardProps {
  fields: PaymentCardFields;
  flipped: boolean;
  onToggleFlip: () => void;
}

function FlipIcon({ flipped }: { flipped: boolean }) {
  return (
    <motion.svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      animate={{ rotate: flipped ? 180 : 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11v-1a4 4 0 014-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v1a4 4 0 01-4 4H3" />
    </motion.svg>
  );
}

function FlipCardButton({
  flipped,
  onClick,
}: {
  flipped: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-cyan-500/25 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.12)] transition-[border-color,box-shadow] duration-300 hover:border-cyan-400/45 hover:shadow-[0_0_32px_rgba(34,211,238,0.22)] sm:gap-2.5 sm:px-5"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <FlipIcon flipped={flipped} />
      <motion.span
        key={flipped ? "back" : "front"}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {flipped ? "Show front" : "Flip card"}
      </motion.span>
    </motion.button>
  );
}

function MastercardLogo() {
  return (
    <div className="flex items-center">
      <div className="h-8 w-8 rounded-full bg-[#eb001b]" />
      <div className="-ml-3.5 h-8 w-8 rounded-full bg-[#f79e1b]" />
      <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/85">
        mastercard
      </span>
    </div>
  );
}

function VisaLogo() {
  return (
    <span className="text-xl font-bold italic tracking-tight text-white">VISA</span>
  );
}

function ChipIcon() {
  return (
    <div className="h-8 w-10 rounded-md bg-gradient-to-br from-amber-100 via-amber-400 to-amber-700 p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)] sm:h-10 sm:w-12 sm:p-1">
      <div className="grid h-full w-full grid-cols-2 gap-px rounded-sm border border-amber-800/50">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[2px] bg-amber-900/30" />
        ))}
      </div>
    </div>
  );
}

function CardDecor() {
  return (
    <>
      <div className="pointer-events-none absolute bottom-0 left-0 h-full w-3/5 bg-gradient-to-tr from-white/[0.06] to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,255,255,0.08),transparent_55%)]" />
    </>
  );
}

export function AnimatedPaymentCard({
  fields,
  flipped,
  onToggleFlip,
}: AnimatedPaymentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 260,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-9, 9]), {
    stiffness: 260,
    damping: 22,
  });

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (flipped) return;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [flipped, mouseX, mouseY],
  );

  const handleLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

  const brand = cardBrand(fields.card);
  const numberDisplay = displayCardNumber(fields.card);
  const nameDisplay = displayCardName(fields.cardName || fields.name);
  const expiryDisplay = displayExpiry(fields.expiry);
  const cvvDisplay = displayCvv(fields.cvv);

  return (
    <div className="mb-5 flex flex-col items-center gap-3">
      <div className="perspective-[1400px] w-full max-w-[440px] px-0 py-2 sm:px-1">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMove}
          onMouseLeave={handleLeave}
          style={{
            rotateX: flipped ? 0 : rotateX,
            rotateY: flipped ? 0 : rotateY,
            transformStyle: "preserve-3d",
          }}
          className="relative mx-auto aspect-[1.586/1] w-full"
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <div
              className="payment-card-face absolute inset-0 rounded-[14px] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:rounded-[18px] sm:p-6 md:p-7"
              style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            >
              <CardDecor />
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-serif text-xs font-bold tracking-[0.18em] text-white sm:text-base sm:tracking-[0.22em]">
                    PLATINUM
                  </span>
                  <span className="font-serif text-[10px] text-white/90 sm:text-sm">Pack &amp; Ship</span>
                </div>

                <div className="mt-3 sm:mt-5">
                  <ChipIcon />
                </div>

                <div className="mt-auto space-y-3 pt-4 sm:space-y-4 sm:pt-6">
                  <p className="font-serif text-xs tracking-wide text-white/85 sm:text-sm">{nameDisplay}</p>
                  <motion.p
                    key={numberDisplay}
                    initial={{ opacity: 0.55, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-[clamp(1rem,4.5vw,1.35rem)] tracking-[0.2em] text-white"
                  >
                    {numberDisplay}
                  </motion.p>
                  <div className="flex items-end justify-end">
                    {brand === "visa" ? <VisaLogo /> : <MastercardLogo />}
                  </div>
                </div>
              </div>
            </div>

            {/* Back */}
            <div
              className="payment-card-face payment-card-back absolute inset-0 rounded-[14px] shadow-[0_24px_60px_rgba(0,0,0,0.55)] sm:rounded-[18px]"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="absolute inset-x-0 top-[22%] h-12 bg-zinc-950/95" />

              <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-5 sm:px-7 sm:pb-7 sm:pt-6">
                <div className="flex flex-1 flex-col justify-center">
                  <div className="flex justify-end pr-1">
                    <div className="min-w-[72px] rounded-md bg-white px-4 py-2.5 text-center font-mono text-base tracking-[0.35em] text-zinc-900 shadow-inner">
                      {cvvDisplay}
                    </div>
                  </div>
                  <p className="mt-2 pr-1 text-right text-[10px] font-medium uppercase tracking-widest text-white/45">
                    CVV
                  </p>
                </div>

                <div className="flex items-end justify-end gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-white/45">
                      Expiry
                    </p>
                    <motion.p
                      key={expiryDisplay}
                      initial={{ opacity: 0.55 }}
                      animate={{ opacity: 1 }}
                      className="font-mono text-xl tracking-wider text-white"
                    >
                      {expiryDisplay}
                    </motion.p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <FlipCardButton flipped={flipped} onClick={onToggleFlip} />
    </div>
  );
}
