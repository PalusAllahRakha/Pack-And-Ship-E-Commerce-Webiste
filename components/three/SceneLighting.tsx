"use client";

import { ContactShadows, Environment } from "@react-three/drei";

interface SceneLightingProps {
  preset?: "city" | "night" | "studio";
  shadows?: boolean;
  intensity?: number;
}

export function SceneLighting({
  preset = "city",
  shadows = true,
  intensity = 1,
}: SceneLightingProps) {
  return (
    <>
      <ambientLight intensity={0.48 * intensity} />
      <directionalLight
        position={[5, 11, 6]}
        intensity={1.45 * intensity}
        color="#f0f9ff"
        castShadow={shadows}
      />
      <directionalLight
        position={[-4, 4, -3]}
        intensity={0.42 * intensity}
        color="#c4b5fd"
      />
      <pointLight position={[0, 2.5, 3]} intensity={0.7 * intensity} color="#22d3ee" />
      <Environment preset={preset} />
      {shadows && (
        <ContactShadows position={[0, 0, 0]} opacity={0.48} scale={14} blur={2.6} />
      )}
    </>
  );
}

export function SceneBackdrop({
  fogFar = 28,
  variant = "dark",
}: {
  fogFar?: number;
  variant?: "dark" | "light";
}) {
  const bg = variant === "light" ? "#eef2f7" : "#06060c";
  return (
    <>
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, 8, fogFar]} />
    </>
  );
}
