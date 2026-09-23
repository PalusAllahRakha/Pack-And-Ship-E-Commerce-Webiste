"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

export interface SceneBounds {
  minX: number;
  maxX: number;
  maxY?: number;
}

interface FramedSceneCameraProps {
  bounds: SceneBounds;
  lookAtY?: number;
  padding?: number;
}

export function FramedSceneCamera({
  bounds,
  lookAtY = 0.45,
  padding = 1.25,
}: FramedSceneCameraProps) {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    const cam = camera as PerspectiveCamera;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const spanX = (bounds.maxX - bounds.minX) * padding;
    const spanY = (bounds.maxY ?? 2.2) * 1.2;
    const aspect = size.width / Math.max(size.height, 1);

    const maxVFov =
      aspect > 2.4 ? 34 : aspect > 1.75 ? 38 : aspect < 0.75 ? 50 : 42;

    let vFov = Math.min(36, maxVFov);
    let distance = 6;

    for (let i = 0; i < 12; i++) {
      const vRad = (vFov * Math.PI) / 180;
      const hRad = 2 * Math.atan(Math.tan(vRad / 2) * aspect);
      const distX = (spanX / 2) / Math.tan(hRad / 2);
      const distY = (spanY / 2) / Math.tan(vRad / 2);
      distance = Math.max(distX, distY, 5);

      const halfVisibleX = distance * Math.tan(hRad / 2);
      const halfVisibleY = distance * Math.tan(vRad / 2);
      if (halfVisibleX >= spanX / 2 && halfVisibleY >= spanY / 2) break;
      vFov = Math.min(maxVFov, vFov + 1.5);
    }

    cam.aspect = aspect;
    cam.fov = vFov;
    cam.position.set(centerX, lookAtY + distance * 0.2, distance);
    cam.lookAt(centerX, lookAtY, 0);
    cam.updateProjectionMatrix();
  }, [
    bounds.minX,
    bounds.maxX,
    bounds.maxY,
    size.width,
    size.height,
    camera,
    lookAtY,
    padding,
  ]);

  return null;
}
