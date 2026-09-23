"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useThemeStore } from "@/store/themeStore";

const STARS = [
  { x: 10, y: 8, s: 1.2, d: 0 },
  { x: 22, y: 14, s: 0.8, d: 0.15 },
  { x: 38, y: 6, s: 1, d: 0.3 },
  { x: 48, y: 16, s: 0.7, d: 0.45 },
];

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const prefersReducedMotion = useReducedMotion();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
    >
      <motion.span
        className="theme-toggle__track"
        animate={
          isDark
            ? {
                background:
                  "linear-gradient(135deg, #1e1b4b 0%, #0f172a 55%, #172554 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 16px rgba(15,23,42,0.35)",
              }
            : {
                background:
                  "linear-gradient(135deg, #7dd3fc 0%, #fde68a 52%, #fbbf24 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.55), 0 4px 16px rgba(251,191,36,0.25)",
              }
        }
        transition={{ duration: prefersReducedMotion ? 0 : 0.55, ease: "easeInOut" }}
      >
        <AnimatePresence>
          {isDark &&
            !prefersReducedMotion &&
            STARS.map((star) => (
              <motion.span
                key={`${star.x}-${star.y}`}
                className="theme-toggle__star"
                style={{ left: star.x, top: star.y, width: star.s * 2, height: star.s * 2 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0.35, 0.9, 0.35], scale: [0.8, 1.1, 0.8] }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: star.d,
                  ease: "easeInOut",
                }}
              />
            ))}
        </AnimatePresence>

        <motion.span
          className="theme-toggle__cloud"
          animate={{
            opacity: isDark ? 0 : 1,
            x: isDark ? -8 : 0,
            scale: isDark ? 0.6 : 1,
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
        />

        <motion.span
          className="theme-toggle__thumb"
          animate={{ x: isDark ? 30 : 2 }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 520, damping: 32, mass: 0.8 }
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDark ? "moon" : "sun"}
              className="theme-toggle__icon"
              initial={{ opacity: 0, rotate: -40, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 40, scale: 0.5 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.22 }}
            >
              {isDark ? <MoonIcon /> : <SunIcon />}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      </motion.span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <circle cx="12" cy="12" r="4.5" fill="#f59e0b" />
      <g stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2.5v2.8M12 18.7v2.8M2.5 12h2.8M18.7 12h2.8M4.9 4.9l2 2M17.1 17.1l2 2M4.9 19.1l2-2M17.1 6.9l2-2" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M15.5 4.2a7.2 7.2 0 1 0 4.3 12.8A6.2 6.2 0 0 1 15.5 4.2Z"
        fill="#e2e8f0"
      />
      <circle cx="17.5" cy="7.5" r="0.9" fill="#cbd5e1" opacity="0.65" />
      <circle cx="14.8" cy="11.2" r="0.55" fill="#cbd5e1" opacity="0.45" />
    </svg>
  );
}
