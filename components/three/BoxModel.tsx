"use client";

import { forwardRef, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import type { Group } from "three";
import { MODEL_PATHS } from "@/lib/models";

export const BoxBody = forwardRef<Group>(function BoxBody(_, ref) {
  const { scene } = useGLTF(MODEL_PATHS.box);
  const box = useMemo(() => scene.clone(), [scene]);

  return (
    <group ref={ref} scale={0.55} position={[0, 0, 0]}>
      <primitive object={box} />
    </group>
  );
});

useGLTF.preload(MODEL_PATHS.box);
