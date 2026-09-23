"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import type { WebGLRenderer } from "three";
import {
  getWebGLRecoveryDelayMs,
  isWebGLAvailable,
  markWebGLContextLost,
  markWebGLUnavailable,
  releaseWebGLSlot,
  requestWebGLSlot,
  resetWebGLProbe,
} from "@/lib/webglManager";

interface SceneCanvasProps {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov?: number };
  fallback?: ReactNode;
  lowPower?: boolean;
}

function CanvasLoader() {
  return null;
}

function WebGLFallback({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#07070d]/90 p-6 text-center">
      <div>
        <p className="text-sm text-zinc-400">{message}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-500/20"
          >
            Retry 3D
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  );
}

const MAX_ACQUIRE_RETRIES = 5;

function disposeRenderer(renderer: WebGLRenderer | null) {
  if (!renderer) return;
  const canvas = renderer.domElement;
  const handlers = (renderer as WebGLRenderer & {
    __sceneCanvasHandlers?: { lost: (e: Event) => void; restored: () => void };
  }).__sceneCanvasHandlers;
  if (canvas && handlers) {
    canvas.removeEventListener("webglcontextlost", handlers.lost);
    canvas.removeEventListener("webglcontextrestored", handlers.restored);
  }
  renderer.dispose();
}

export function SceneCanvas({
  children,
  className = "h-full w-full",
  camera = { position: [0, 0, 5], fov: 45 },
  fallback,
  lowPower = false,
}: SceneCanvasProps) {
  const [mountKey, setMountKey] = useState(0);
  const [phase, setPhase] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  const aliveRef = useRef(true);
  const slotHeldRef = useRef(false);
  const contextLostRef = useRef(false);
  const rendererRef = useRef<WebGLRenderer | null>(null);

  const releaseSlot = useCallback(() => {
    if (!slotHeldRef.current) return;
    slotHeldRef.current = false;
    releaseWebGLSlot();
  }, []);

  const remountCanvas = useCallback(() => {
    disposeRenderer(rendererRef.current);
    rendererRef.current = null;
    releaseSlot();
    resetWebGLProbe();
    contextLostRef.current = false;
    setPhase("loading");
    setMountKey((k) => k + 1);
  }, [releaseSlot]);

  const handleRetry = useCallback(() => {
    const waitMs = getWebGLRecoveryDelayMs();
    if (waitMs > 0) {
      window.setTimeout(remountCanvas, waitMs);
      return;
    }
    remountCanvas();
  }, [remountCanvas]);

  const acquireSlot = useCallback(async () => {
    const recoveryWait = getWebGLRecoveryDelayMs();
    if (recoveryWait > 0) {
      await new Promise((r) => setTimeout(r, recoveryWait));
    }

    for (let attempt = 0; attempt < MAX_ACQUIRE_RETRIES; attempt++) {
      if (!aliveRef.current) return;

      if (!isWebGLAvailable()) {
        resetWebGLProbe();
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }

      try {
        await requestWebGLSlot();
      } catch {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }

      if (!aliveRef.current) {
        releaseWebGLSlot();
        return;
      }

      slotHeldRef.current = true;
      setPhase("ready");
      return;
    }

    if (aliveRef.current) setPhase("unavailable");
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    contextLostRef.current = false;
    slotHeldRef.current = false;
    setPhase("loading");
    acquireSlot();

    return () => {
      aliveRef.current = false;
      disposeRenderer(rendererRef.current);
      rendererRef.current = null;
      releaseSlot();
    };
  }, [mountKey, acquireSlot, releaseSlot]);

  const handleContextLost = useCallback(
    (e: Event) => {
      e.preventDefault();
      if (contextLostRef.current || !aliveRef.current) return;
      contextLostRef.current = true;
      markWebGLContextLost();
      disposeRenderer(rendererRef.current);
      rendererRef.current = null;
      releaseSlot();
      setPhase("unavailable");
    },
    [releaseSlot],
  );

  if (phase === "unavailable") {
    return (
      <div className={`relative h-full w-full min-h-0 overflow-hidden ${className}`}>
        {fallback ?? (
          <WebGLFallback
            message="3D preview paused after a graphics reset. Wait a moment, then tap retry."
            onRetry={handleRetry}
          />
        )}
      </div>
    );
  }

  const maxDpr = lowPower
    ? 1
    : Math.min(1.5, typeof window !== "undefined" ? window.devicePixelRatio : 1.5);

  return (
    <div className={`relative h-full w-full min-h-0 overflow-hidden ${className}`}>
      {phase === "loading" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#07070d]/80">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-400" />
        </div>
      )}
      {phase === "ready" && (
        <Canvas
          key={mountKey}
          className="!h-full !w-full"
          style={{ width: "100%", height: "100%" }}
          dpr={[1, maxDpr]}
          camera={camera}
          gl={{
            antialias: !lowPower,
            alpha: true,
            powerPreference: lowPower ? "low-power" : "default",
            failIfMajorPerformanceCaveat: false,
            preserveDrawingBuffer: false,
          }}
          onCreated={({ gl }) => {
            rendererRef.current = gl;
            const canvas = gl.domElement;

            const onLost = (event: Event) => handleContextLost(event);
            const onRestored = () => {
              if (!aliveRef.current || !contextLostRef.current) return;
              contextLostRef.current = false;
              resetWebGLProbe();
              setPhase("unavailable");
            };

            canvas.addEventListener("webglcontextlost", onLost, false);
            canvas.addEventListener("webglcontextrestored", onRestored, false);
            (gl as WebGLRenderer & {
              __sceneCanvasHandlers?: { lost: (e: Event) => void; restored: () => void };
            }).__sceneCanvasHandlers = { lost: onLost, restored: onRestored };

            const ctx = gl.getContext();
            if (ctx && "isContextLost" in ctx && ctx.isContextLost()) {
              markWebGLUnavailable();
              handleContextLost(new Event("webglcontextlost"));
            }
          }}
        >
          <Suspense fallback={<CanvasLoader />}>{children}</Suspense>
        </Canvas>
      )}
    </div>
  );
}
