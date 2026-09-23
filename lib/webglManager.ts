const CLEANUP_MS = 1500;
const RECOVERY_BLOCK_MS = 3000;

let webglSupported: boolean | null = null;
let activeContexts = 0;
let cooldownUntil = 0;
let recoveryBlockUntil = 0;
let cooldownTimer: ReturnType<typeof setTimeout> | null = null;
const waitQueue: Array<() => void> = [];

function flushWaitQueue() {
  if (activeContexts > 0) return;
  if (Date.now() < cooldownUntil) return;
  if (Date.now() < recoveryBlockUntil) return;

  const next = waitQueue.shift();
  if (!next) return;
  activeContexts = 1;
  next();
  if (waitQueue.length > 0 && activeContexts === 0) {
    flushWaitQueue();
  }
}

function scheduleFlush() {
  if (cooldownTimer) clearTimeout(cooldownTimer);
  const delay = Math.max(
    0,
    Math.max(cooldownUntil, recoveryBlockUntil) - Date.now(),
  );
  cooldownTimer = setTimeout(() => {
    cooldownTimer = null;
    flushWaitQueue();
  }, delay);
}

export function requestWebGLSlot(): Promise<void> {
  return new Promise((resolve) => {
    waitQueue.push(resolve);
    if (
      activeContexts === 0 &&
      Date.now() >= cooldownUntil &&
      Date.now() >= recoveryBlockUntil
    ) {
      flushWaitQueue();
    } else {
      scheduleFlush();
    }
  });
}

export function releaseWebGLSlot(): void {
  activeContexts = 0;
  cooldownUntil = Date.now() + CLEANUP_MS;
  scheduleFlush();
}

/** Cached probe — releases test context so we do not exhaust the browser limit. */
export function isWebGLAvailable(): boolean {
  if (webglSupported !== null) return webglSupported;
  if (typeof document === "undefined") return false;
  if (Date.now() < recoveryBlockUntil) return false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ??
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false });

    if (!gl) {
      webglSupported = false;
      return false;
    }

    gl.getExtension("WEBGL_lose_context")?.loseContext();
    webglSupported = true;
    return true;
  } catch {
    webglSupported = false;
    return false;
  }
}

export function markWebGLContextLost(): void {
  recoveryBlockUntil = Date.now() + RECOVERY_BLOCK_MS;
  scheduleFlush();
}

export function markWebGLUnavailable(): void {
  webglSupported = false;
}

export function resetWebGLProbe(): void {
  webglSupported = null;
}

export function getWebGLRecoveryDelayMs(): number {
  return Math.max(0, recoveryBlockUntil - Date.now());
}
