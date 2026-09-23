"use client";

import type { AddressType } from "@/lib/types";

function HomeProcedural() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.1, 1.1]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.05, 0.65, 4]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.85} />
      </mesh>
      <mesh position={[0.35, 0.45, 0.56]} castShadow>
        <boxGeometry args={[0.28, 0.45, 0.04]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[-0.35, 0.45, 0.56]} castShadow>
        <boxGeometry args={[0.28, 0.45, 0.04]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0.12, 0.62]} castShadow>
        <boxGeometry args={[0.42, 0.24, 0.04]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.95, 24]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
    </group>
  );
}

function OfficeProcedural() {
  return (
    <group>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 1.8, 1.2]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.65} metalness={0.15} />
      </mesh>
      {[-0.45, 0, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0.61]} castShadow>
          <boxGeometry args={[0.22, 0.35, 0.04]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#0891b2"
            emissiveIntensity={0.2 + i * 0.05}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.85, 0]} castShadow>
        <boxGeometry args={[1.55, 0.12, 1.25]} />
        <meshStandardMaterial color="#64748b" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.8, 1.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
    </group>
  );
}

function WarehouseProcedural() {
  return (
    <group>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.1, 1.4]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[2.3, 0.08, 1.5]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 0.35, 0.71]} castShadow>
        <boxGeometry args={[1.4, 0.7, 0.04]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>
      <mesh position={[-0.9, 0.2, 0.85]} castShadow>
        <boxGeometry args={[0.35, 0.4, 0.04]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

interface DestinationBuildingProps {
  type: AddressType;
  scale?: number;
}

export function DestinationBuilding({ type, scale = 0.55 }: DestinationBuildingProps) {
  return (
    <group scale={scale}>
      {type === "office" ? <OfficeProcedural /> : <HomeProcedural />}
    </group>
  );
}

export function WarehouseBuilding({ scale = 0.5 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <WarehouseProcedural />
    </group>
  );
}
