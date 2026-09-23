"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";

interface GltfModelProps {
  path: string;
  targetSize?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  onLoaded?: () => void;
}

function fitModelToBox(root: Group, targetSize: number) {
  root.scale.setScalar(1);
  root.position.set(0, 0, 0);
  root.updateWorldMatrix(true, true);

  const bounds = new THREE.Box3().setFromObject(root);
  if (bounds.isEmpty()) return;

  const size = bounds.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 0.0001);
  const scale = targetSize / maxDim;
  root.scale.setScalar(scale);
  root.updateWorldMatrix(true, true);

  const fitted = new THREE.Box3().setFromObject(root);
  root.position.y = -fitted.min.y;
}

export function GltfModel({
  path,
  targetSize = 1.25,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  onLoaded,
}: GltfModelProps) {
  const { scene } = useGLTF(path);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.envMapIntensity = 1;
            }
          });
        }
      }
    });
    return clone;
  }, [scene]);

  const rootRef = useRef<Group>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    fitModelToBox(root, targetSize);
    onLoaded?.();
  }, [model, targetSize, onLoaded]);

  return (
    <group ref={rootRef} position={position} rotation={rotation}>
      <primitive object={model} />
    </group>
  );
}

export function preloadGltfModel(path: string) {
  useGLTF.preload(path);
}
