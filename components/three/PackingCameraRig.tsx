"use client";

import { useFrame, useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";

export interface CameraRigState {
  px: number;
  py: number;
  pz: number;
  lx: number;
  ly: number;
  lz: number;
  fov?: number;
}

export const PACKING_CAMERA_WIDE: CameraRigState = {
  px: 0,
  py: 2.75,
  pz: 7.2,
  lx: 0,
  ly: 0.45,
  lz: 0,
};

export const PACKING_CAMERA_BOX_TOP: CameraRigState = {
  px: 0,
  py: 5.8,
  pz: 0.12,
  lx: 0,
  ly: 0.48,
  lz: 0,
  fov: 48,
};

export const PACKING_CAMERA_TRUCK: CameraRigState = {
  px: 0.8,
  py: 2.15,
  pz: 8.2,
  lx: 0.4,
  ly: 0.45,
  lz: 0,
};

interface PackingCameraRigProps {
  rigRef: React.MutableRefObject<CameraRigState>;
}

export function PackingCameraRig({ rigRef }: PackingCameraRigProps) {
  const { camera, size } = useThree();

  useFrame(() => {
    const cam = camera as PerspectiveCamera;
    const r = rigRef.current;
    cam.aspect = size.width / Math.max(size.height, 1);
    cam.fov = r.fov ?? 42;
    cam.position.set(r.px, r.py, r.pz);
    cam.lookAt(r.lx, r.ly, r.lz);
    cam.updateProjectionMatrix();
  });

  return null;
}
