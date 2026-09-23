"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Category } from "@/lib/types";
import { productMaterial } from "@/lib/sceneMaterials";

export type ProductShapeSize = "hero" | "pack" | "mini" | "preview";

const SIZE_SCALE: Record<ProductShapeSize, number> = {
  hero: 1,
  pack: 0.38,
  mini: 0.14,
  preview: 0.1,
};

export interface ProductShape3DProps {
  slug: string;
  image: string;
  category: Category;
  size?: ProductShapeSize;
  exploded?: boolean;
}

function useProductMat(image: string, category: Category) {
  const texture = useTexture(image);
  return useMemo(() => productMaterial(texture, category), [texture, category]);
}

function Wood({ color = "#8b6914" }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.72} metalness={0.05} />;
}

function Metal({ color = "#a8a29e" }: { color?: string }) {
  return <meshStandardMaterial color={color} roughness={0.35} metalness={0.55} />;
}

function AppleCluster({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      <mesh position={[0, 0.08, 0]} castShadow material={mat}>
        <sphereGeometry args={[0.42, 24, 24]} />
      </mesh>
      <mesh position={[-0.28, -0.02, 0.12]} castShadow material={mat}>
        <sphereGeometry args={[0.36, 20, 20]} />
      </mesh>
      <mesh position={[0.26, -0.04, -0.1]} castShadow material={mat}>
        <sphereGeometry args={[0.34, 20, 20]} />
      </mesh>
    </group>
  );
}

function BananaBunch({ mat }: { mat: THREE.Material }) {
  return (
    <group rotation={[0.2, 0.4, 0]}>
      {[0, 0.35, 0.7].map((y, i) => (
        <mesh key={i} position={[i * 0.08 - 0.08, y * 0.12, 0]} rotation={[0, 0, 0.55]} castShadow material={mat}>
          <capsuleGeometry args={[0.1, 0.55, 8, 16]} />
        </mesh>
      ))}
    </group>
  );
}

function StrawberryPunnet({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      <mesh position={[0, -0.08, 0]} castShadow>
        <boxGeometry args={[0.9, 0.18, 0.7]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.55} roughness={0.2} />
      </mesh>
      {[
        [-0.2, 0.1, 0.1],
        [0.15, 0.08, -0.05],
        [0, 0.12, 0.15],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow material={mat}>
          <coneGeometry args={[0.14, 0.28, 12]} />
        </mesh>
      ))}
    </group>
  );
}

function MangoTrio({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      {[
        [0, 0, 0],
        [-0.28, -0.05, 0.12],
        [0.25, -0.06, -0.1],
      ].map((pos, i) => (
        <mesh
          key={i}
          position={pos as [number, number, number]}
          rotation={[0.3, i * 0.8, 0]}
          scale={[0.55, 0.85, 0.7]}
          castShadow
          material={mat}
        >
          <sphereGeometry args={[0.32, 20, 20]} />
        </mesh>
      ))}
    </group>
  );
}

function BlueberryClamshell({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      <mesh position={[0, -0.06, 0]} castShadow>
        <boxGeometry args={[0.85, 0.12, 0.65]} />
        <meshStandardMaterial color="#dbeafe" transparent opacity={0.7} roughness={0.15} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (i % 4) * 0.16 - 0.24,
            0.02 + Math.floor(i / 4) * 0.08,
            (i % 2) * 0.12 - 0.06,
          ]}
          castShadow
          material={mat}
        >
          <sphereGeometry args={[0.06, 10, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function EarbudsSet({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      <mesh castShadow material={mat}>
        <boxGeometry args={[0.75, 0.42, 0.32]} />
      </mesh>
      <mesh position={[-0.22, 0.18, 0]} castShadow material={mat}>
        <sphereGeometry args={[0.12, 16, 16]} />
      </mesh>
      <mesh position={[0.22, 0.18, 0]} castShadow material={mat}>
        <sphereGeometry args={[0.12, 16, 16]} />
      </mesh>
      <mesh scale={1.08}>
        <boxGeometry args={[0.82, 0.48, 0.38]} />
        <meshStandardMaterial color="#22d3ee" transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  );
}

function SmartWatch({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      <mesh castShadow material={mat}>
        <boxGeometry args={[0.55, 0.7, 0.14]} />
      </mesh>
      <mesh position={[0, 0, 0.09]} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
        <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.2, 0.12, 0.08]} />
        <Metal />
      </mesh>
      <mesh position={[0, -0.42, 0]} castShadow>
        <boxGeometry args={[0.2, 0.12, 0.08]} />
        <Metal />
      </mesh>
    </group>
  );
}

function PortableSpeaker({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      <mesh castShadow material={mat}>
        <cylinderGeometry args={[0.42, 0.42, 0.75, 24]} />
      </mesh>
      <mesh position={[0, 0, 0.38]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.04, 20]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.15 - i * 0.15, 0.39]}>
          <torusGeometry args={[0.12 + i * 0.04, 0.015, 8, 24]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      ))}
    </group>
  );
}

function MechanicalKeyboard({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      <mesh castShadow material={mat}>
        <boxGeometry args={[1.5, 0.12, 0.55]} />
      </mesh>
      {Array.from({ length: 18 }).map((_, i) => (
        <mesh key={i} position={[(i % 6) * 0.22 - 0.55, 0.1, Math.floor(i / 6) * 0.16 - 0.16]} castShadow>
          <boxGeometry args={[0.16, 0.06, 0.14]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function UsbHub({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      <mesh castShadow material={mat}>
        <boxGeometry args={[1.1, 0.14, 0.35]} />
      </mesh>
      {[-0.35, -0.12, 0.12, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0.2]} castShadow>
          <boxGeometry args={[0.08, 0.06, 0.08]} />
          <Metal color="#64748b" />
        </mesh>
      ))}
      <mesh position={[0.42, 0.02, -0.12]} castShadow>
        <boxGeometry args={[0.12, 0.06, 0.06]} />
        <Metal color="#475569" />
      </mesh>
    </group>
  );
}

function OakBookshelf({ mat, exploded }: { mat: THREE.Material; exploded: boolean }) {
  const spread = exploded ? 1 : 0;
  return (
    <group>
      {[0, 0.35, 0.7, 1.05, 1.4].map((y, i) => (
        <mesh key={i} position={[0.15 * spread, y, 0]} rotation={[0, 0, 0.12]} castShadow material={mat}>
          <boxGeometry args={[1.2, 0.08, 0.45]} />
        </mesh>
      ))}
      <mesh position={[-0.45 - 0.1 * spread, 0.7, 0]} castShadow material={mat}>
        <boxGeometry args={[0.1, 1.5, 0.45]} />
      </mesh>
      <mesh position={[0.45 + 0.1 * spread, 0.7, 0]} castShadow material={mat}>
        <boxGeometry args={[0.1, 1.5, 0.45]} />
      </mesh>
    </group>
  );
}

function ErgonomicChair({ mat, exploded }: { mat: THREE.Material; exploded: boolean }) {
  const spread = exploded ? 1 : 0;
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow material={mat}>
        <boxGeometry args={[0.85, 0.14, 0.8]} />
      </mesh>
      <mesh position={[0, 0.55, -0.32 - 0.2 * spread]} castShadow material={mat}>
        <boxGeometry args={[0.8, 0.9, 0.1]} />
      </mesh>
      {[
        [-0.32, -0.12, 0.28],
        [0.32, -0.12, 0.28],
        [-0.32, -0.12, -0.28],
        [0.32, -0.12, -0.28],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.35, 8]} />
          <Metal />
        </mesh>
      ))}
    </group>
  );
}

function CoffeeTable({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      <mesh position={[0, 0.28, 0]} castShadow material={mat}>
        <boxGeometry args={[1.2, 0.1, 0.75]} />
      </mesh>
      {[
        [-0.48, 0.12, -0.28],
        [0.48, 0.12, -0.28],
        [-0.48, 0.12, 0.28],
        [0.48, 0.12, 0.28],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.05, 0.04, 0.24, 10]} />
          <Wood color="#6b4f2a" />
        </mesh>
      ))}
    </group>
  );
}

function DeskLamp({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.12, 16]} />
        <Metal />
      </mesh>
      <mesh position={[0, 0.45, 0]} rotation={[0, 0, 0.25]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.7, 8]} />
        <Metal />
      </mesh>
      <mesh position={[0.2, 0.72, 0]} rotation={[0.8, 0, 0]} castShadow material={mat}>
        <coneGeometry args={[0.22, 0.28, 16, 1, true]} />
      </mesh>
    </group>
  );
}

function PlantStand({ mat }: { mat: THREE.Material }) {
  return (
    <group>
      {[0.2, 0.55, 0.9].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow material={mat}>
          <cylinderGeometry args={[0.35 - i * 0.08, 0.38 - i * 0.08, 0.06, 16]} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.1, 12]} />
        <Wood color="#a16207" />
      </mesh>
    </group>
  );
}

function CategoryFallback({ category, mat }: { category: Category; mat: THREE.Material }) {
  if (category === "fruit") {
    return (
      <mesh castShadow material={mat}>
        <sphereGeometry args={[0.45, 24, 24]} />
      </mesh>
    );
  }
  if (category === "electronics") {
    return (
      <mesh castShadow material={mat}>
        <boxGeometry args={[0.9, 0.9, 0.25]} />
      </mesh>
    );
  }
  return (
    <mesh castShadow material={mat}>
      <boxGeometry args={[0.9, 0.65, 0.55]} />
    </mesh>
  );
}

function ProductShapeInner({
  slug,
  category,
  mat,
  exploded,
}: {
  slug: string;
  category: Category;
  mat: THREE.Material;
  exploded: boolean;
}) {
  switch (slug) {
    case "honeycrisp-apples":
      return <AppleCluster mat={mat} />;
    case "organic-bananas":
      return <BananaBunch mat={mat} />;
    case "strawberry-pint":
      return <StrawberryPunnet mat={mat} />;
    case "mango-trio":
      return <MangoTrio mat={mat} />;
    case "blueberry-clamshell":
      return <BlueberryClamshell mat={mat} />;
    case "wireless-earbuds":
      return <EarbudsSet mat={mat} />;
    case "smart-watch":
      return <SmartWatch mat={mat} />;
    case "portable-speaker":
      return <PortableSpeaker mat={mat} />;
    case "mechanical-keyboard":
      return <MechanicalKeyboard mat={mat} />;
    case "usb-c-hub":
      return <UsbHub mat={mat} />;
    case "oak-bookshelf":
      return <OakBookshelf mat={mat} exploded={exploded} />;
    case "ergonomic-chair":
      return <ErgonomicChair mat={mat} exploded={exploded} />;
    case "coffee-table":
      return <CoffeeTable mat={mat} />;
    case "desk-lamp":
      return <DeskLamp mat={mat} />;
    case "floor-plant-stand":
      return <PlantStand mat={mat} />;
    default:
      return <CategoryFallback category={category} mat={mat} />;
  }
}

export function ProductShape3D({
  slug,
  image,
  category,
  size = "hero",
  exploded = false,
}: ProductShape3DProps) {
  const mat = useProductMat(image, category);
  const scale = SIZE_SCALE[size];

  return (
    <group scale={scale}>
      <ProductShapeInner slug={slug} category={category} mat={mat} exploded={exploded} />
    </group>
  );
}
