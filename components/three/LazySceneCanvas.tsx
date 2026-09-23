"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { SceneErrorBoundary } from "@/components/ui/SceneErrorBoundary";

const SceneCanvas = dynamic(
  () =>
    import("@/components/three/SceneCanvas").then((mod) => ({
      default: mod.SceneCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#07070d]/80">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
      </div>
    ),
  },
);

export function LazySceneCanvas(props: ComponentProps<typeof SceneCanvas>) {
  return (
    <SceneErrorBoundary>
      <SceneCanvas {...props} />
    </SceneErrorBoundary>
  );
}

export type LazySceneCanvasProps = ComponentProps<typeof SceneCanvas>;
