"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { LazySceneCanvas } from "@/components/three/LazySceneCanvas";
import { HERO_CYCLE_SEC } from "@/lib/heroCycle";
import type { Category } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/types";

const HeroScene = dynamic(() => import("@/components/three/HeroScene"), {
  ssr: false,
  loading: () => null,
});

const CATEGORIES: Category[] = ["fruit", "electronics", "furniture"];

const CATEGORY_LINKS: Record<Category, string> = {
  fruit: "/shop/fruit",
  electronics: "/shop/electronics",
  furniture: "/shop/furniture",
};

const CATEGORY_EMOJI: Record<Category, string> = {
  fruit: "🍎",
  electronics: "🎧",
  furniture: "🪑",
};

const FEATURES = [
  {
    icon: "🛍️",
    value: "15+",
    label: "Products",
    hint: "Fruit, tech & home",
    tone: "cyan",
    glow: "shadow-[0_0_24px_rgba(34,211,238,0.12)]",
    border: "hover:border-cyan-500/30",
  },
  {
    icon: "🎮",
    value: "3D",
    label: "Previews",
    hint: "Hero showcase",
    tone: "violet",
    glow: "shadow-[0_0_24px_rgba(139,92,246,0.12)]",
    border: "hover:border-violet-500/30",
  },
  {
    icon: "📦",
    value: "Pack",
    label: "Animation",
    hint: "Box seals live",
    tone: "emerald",
    glow: "shadow-[0_0_24px_rgba(52,211,153,0.12)]",
    border: "hover:border-emerald-500/30",
  },
  {
    icon: "🚚",
    value: "Live",
    label: "Tracking",
    hint: "Truck journey",
    tone: "amber",
    glow: "shadow-[0_0_24px_rgba(251,191,36,0.12)]",
    border: "hover:border-amber-500/30",
  },
  {
    icon: "⚡",
    value: "100%",
    label: "Demo-ready",
    hint: "No signup",
    tone: "pink",
    glow: "shadow-[0_0_24px_rgba(244,114,182,0.12)]",
    border: "hover:border-pink-500/30",
  },
] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
});

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState<Category>("fruit");
  const [domReady, setDomReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(HERO_CYCLE_SEC);
  const sectionRef = useRef<HTMLElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const parallaxRaf = useRef<number | null>(null);
  const pendingParallax = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    pendingParallax.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
    if (parallaxRaf.current !== null) return;
    parallaxRaf.current = requestAnimationFrame(() => {
      setParallax(pendingParallax.current);
      parallaxRaf.current = null;
    });
  }, []);

  const handleCategoryChange = useCallback((category: Category) => {
    setActiveCategory(category);
    setSecondsLeft(HERO_CYCLE_SEC);
  }, []);

  const handleSceneReady = useCallback(() => {
    setSceneReady(true);
  }, []);

  const scrollToShop = useCallback(() => {
    document.getElementById("featured-shop")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 30 && window.scrollY < 120) {
        scrollToShop();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scrollToShop]);

  useEffect(() => {
    if (document.readyState === "complete") {
      setDomReady(true);
      return;
    }
    const onLoad = () => setDomReady(true);
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    const onVis = () => setPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!domReady || !canvasHostRef.current) return;
    const el = canvasHostRef.current;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin: "64px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [domReady]);

  useEffect(() => {
    if (!sceneReady || !inView || !pageVisible) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? HERO_CYCLE_SEC : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [sceneReady, inView, pageVisible, activeCategory]);

  useEffect(() => {
    return () => {
      if (parallaxRaf.current !== null) cancelAnimationFrame(parallaxRaf.current);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) setSceneReady(true);
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="hero-panel relative overflow-hidden rounded-2xl border sm:rounded-3xl"
    >
      <div
        className="hero-grid-overlay pointer-events-none absolute inset-0 opacity-[0.35]"
      />
      <div className="hero-orb hero-orb--cyan pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full blur-3xl" />
      <div className="hero-orb hero-orb--violet pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full blur-3xl" />
      <div className="hero-shine pointer-events-none absolute inset-0" />

      <div className="relative grid min-h-[min(78vh,680px)] lg:min-h-[min(88vh,860px)] lg:grid-cols-[1fr_1.05fr]">
        <div className="relative z-10 flex flex-col justify-center px-3 py-10 sm:px-6 sm:py-8 lg:px-8 lg:py-14 xl:px-10">
          <motion.div {...fadeUp(0)} className="hero-badge mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3.5 py-1.5 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-cyan-200">
              Powered by Three.js
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.08)}
            className="theme-heading mb-4 max-w-xl text-3xl font-bold leading-[1.08] tracking-tight sm:mb-5 sm:text-4xl lg:text-5xl xl:text-[3.25rem]"
          >
            Shop in 2D.{" "}
            <span className="gradient-text">Ship in 3D.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.16)}
            className="theme-subtext mb-6 max-w-lg text-sm leading-relaxed sm:mb-7 sm:text-base lg:text-[1.05rem]"
          >
            Cycling showcase across fruit, electronics, and furniture — 3D packing
            and delivery animations on checkout and tracking.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="mb-6 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                aria-pressed={activeCategory === cat}
                data-category={cat}
                className={`hero-cat-pill rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all sm:px-3.5 sm:py-1.5 sm:text-xs ${
                  activeCategory === cat
                    ? "hero-cat-pill--active"
                    : "hero-cat-pill--idle"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </motion.div>

          <motion.div
            {...fadeUp(0.32)}
            className="mb-8 flex flex-col gap-3 sm:mb-9 sm:flex-row sm:flex-wrap"
          >
            <Link href="/shop" className="btn btn-primary btn-shimmer w-full sm:w-auto">
              Explore Shop
            </Link>
            <Link
              href={CATEGORY_LINKS[activeCategory]}
              className="btn btn-secondary w-full sm:w-auto"
            >
              Shop {CATEGORY_LABELS[activeCategory]}
            </Link>
          </motion.div>

          <motion.div
            {...fadeUp(0.42)}
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5"
          >
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 + i * 0.06, duration: 0.45 }}
                className={`feature-stat-card feature-stat-card--${feature.tone} group relative overflow-hidden rounded-xl border p-3.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 sm:rounded-2xl sm:p-4 ${feature.glow} ${feature.border}`}
              >
                <div className="feature-stat-card__icon mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl text-base sm:h-10 sm:w-10 sm:text-lg">
                  {feature.icon}
                </div>
                <p className="theme-heading text-lg font-bold leading-none sm:text-xl">
                  {feature.value}
                </p>
                <p className="theme-subtext mt-1.5 text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]">
                  {feature.label}
                </p>
                <p className="theme-muted mt-1 text-[10px] leading-snug sm:text-[11px]">
                  {feature.hint}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="relative flex min-h-[300px] items-stretch p-4 pt-0 sm:min-h-[380px] sm:p-5 sm:pt-2 lg:min-h-full lg:p-6 lg:pl-0">
          <div
            ref={canvasHostRef}
            className="hero-canvas-host relative flex-1 overflow-hidden rounded-2xl border sm:rounded-3xl"
          >
            {prefersReducedMotion ? (
              <div className="hero-reduced-placeholder absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <span className="text-4xl">{CATEGORY_EMOJI[activeCategory]}</span>
                <p className="theme-heading mt-3 text-sm font-semibold">
                  {CATEGORY_LABELS[activeCategory]}
                </p>
                <p className="theme-muted mt-1 text-[10px] sm:text-xs">
                  Tap a category to preview · 3D paused for reduced motion
                </p>
              </div>
            ) : (
              domReady &&
              inView &&
              pageVisible && (
                <LazySceneCanvas
                  className="absolute inset-0 h-full w-full"
                  camera={{ position: [0, 1.2, 5.5], fov: 40 }}
                  lowPower
                >
                  <HeroScene
                    parallax={parallax}
                    activeCategory={activeCategory}
                    onCategoryChange={handleCategoryChange}
                    onSceneReady={handleSceneReady}
                    paused={!inView || !pageVisible}
                  />
                </LazySceneCanvas>
              )
            )}

            {!prefersReducedMotion && (!domReady || !sceneReady) && (
              <div className="hero-loading-overlay absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
                <p className="text-[10px] font-medium text-zinc-500 sm:text-xs">
                  {!domReady ? "Preparing experience…" : "Loading 3D preview…"}
                </p>
              </div>
            )}

            <div className="absolute left-3 top-3 z-10 flex items-center gap-2 sm:left-4 sm:top-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="hero-canvas-chip rounded-full border px-2.5 py-1 text-[9px] font-semibold backdrop-blur-md sm:px-3 sm:text-[10px]"
                >
                  {CATEGORY_LABELS[activeCategory]}
                </motion.div>
              </AnimatePresence>
              <div className="hero-canvas-timer relative overflow-hidden rounded-full border backdrop-blur-md">
                <div
                  className="absolute inset-y-0 left-0 bg-cyan-500/12 transition-[width] duration-1000 ease-linear"
                  style={{ width: `${(secondsLeft / HERO_CYCLE_SEC) * 100}%` }}
                />
                <span className="hero-canvas-timer__text relative block px-2 py-1 text-[9px] font-medium tabular-nums sm:px-3 sm:text-[10px]">
                  <span className="sm:hidden">{secondsLeft}s</span>
                  <span className="hidden sm:inline">cycles in {secondsLeft}s</span>
                </span>
              </div>
            </div>

            <div className="absolute bottom-3 left-3 right-3 z-10 flex items-end justify-between gap-2 sm:bottom-4 sm:left-4 sm:right-4">
              <p className="hero-canvas-hint max-w-[55%] text-[10px] leading-snug sm:text-xs">
                {prefersReducedMotion
                  ? "Use category pills to preview"
                  : "Drag to orbit · scroll page to shop"}
              </p>
              <button
                type="button"
                onClick={scrollToShop}
                className="hero-scroll-btn shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-semibold backdrop-blur-md transition-all sm:px-3.5 sm:text-[11px]"
              >
                Scroll to shop ↓
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
