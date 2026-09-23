"use client";

import { forwardRef } from "react";
import type { Group } from "three";
import { PackItems, type PackItemData } from "@/components/three/PackItems";

export const FLAP_NAMES = [
  "flapBackBottom",
  "flapFrontBottom",
  "flapLeftTop",
  "flapRightTop",
] as const;

export const PackingBoxAssembly = forwardRef<
  Group,
  {
    items: PackItemData[];
    itemsRef: React.RefObject<Group | null>;
    onItemsLayout?: () => void;
  }
>(function PackingBoxAssembly({ items, itemsRef, onItemsLayout }, ref) {
  return (
    <group ref={ref}>
      {/* Flat base — erects with parent rotation */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.92, 0.04, 0.92]} />
        <meshStandardMaterial color="#c9a66b" roughness={0.82} />
      </mesh>

      {/* Side walls */}
      {[
        [0, 0.24, 0.46, 0, 0, 0],
        [0, 0.24, -0.46, 0, 0, 0],
        [0.46, 0.24, 0, 0, Math.PI / 2, 0],
        [-0.46, 0.24, 0, 0, Math.PI / 2, 0],
      ].map(([x, y, z, rx, ry, rz], i) => (
        <mesh key={`wall-${i}`} position={[x, y, z]} rotation={[rx, ry, rz]} castShadow>
          <boxGeometry args={[0.92, 0.48, 0.04]} />
          <meshStandardMaterial color="#c9a66b" roughness={0.82} />
        </mesh>
      ))}

      {/* Flaps — close in real order via GSAP */}
      <group name="flapBackBottom" position={[0, 0.48, -0.46]} rotation={[-Math.PI * 0.65, 0, 0]}>
        <mesh position={[0, 0, 0.23]} castShadow>
          <boxGeometry args={[0.92, 0.04, 0.46]} />
          <meshStandardMaterial color="#d4b896" roughness={0.8} />
        </mesh>
      </group>
      <group name="flapFrontBottom" position={[0, 0.48, 0.46]} rotation={[Math.PI * 0.65, 0, 0]}>
        <mesh position={[0, 0, -0.23]} castShadow>
          <boxGeometry args={[0.92, 0.04, 0.46]} />
          <meshStandardMaterial color="#d4b896" roughness={0.8} />
        </mesh>
      </group>
      <group name="flapLeftTop" position={[-0.46, 0.48, 0]} rotation={[0, 0, Math.PI * 0.65]}>
        <mesh position={[0.23, 0, 0]} castShadow>
          <boxGeometry args={[0.46, 0.04, 0.92]} />
          <meshStandardMaterial color="#d4b896" roughness={0.8} />
        </mesh>
      </group>
      <group name="flapRightTop" position={[0.46, 0.48, 0]} rotation={[0, 0, -Math.PI * 0.65]}>
        <mesh position={[-0.23, 0, 0]} castShadow>
          <boxGeometry args={[0.46, 0.04, 0.92]} />
          <meshStandardMaterial color="#d4b896" roughness={0.8} />
        </mesh>
      </group>

      {/* Long tape strip across top seam */}
      <mesh name="tapeTrail" position={[0, 0.52, 0]} scale={[0, 1, 1]} visible={false}>
        <boxGeometry args={[0.94, 0.05, 0.24]} />
        <meshStandardMaterial color="#f5e6c8" emissive="#f5e6c8" emissiveIntensity={0.15} />
      </mesh>

      <PackItems items={items} groupRef={itemsRef} onLayout={onItemsLayout} />
    </group>
  );
});
