"use client";

import { Suspense, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Group } from "three";
import type { Category } from "@/lib/types";
import { getProductModelPath } from "@/lib/showcaseModels";
import { GltfModel } from "@/components/three/GltfModel";
import { ProductImagePlane } from "@/components/three/ProductImagePlane";
import { SceneBackdrop, SceneLighting } from "@/components/three/SceneLighting";

interface ProductPreview3DProps {
  slug: string;
  image: string;
  category: Category;
  model3d?: string;
  exploded?: boolean;
  onReady?: () => void;
}

function PreviewContent({
  image,
  model3d,
  category,
  onReady,
}: ProductPreview3DProps) {
  const modelPath = getProductModelPath(model3d);

  useEffect(() => {
    if (!modelPath) onReady?.();
  }, [modelPath, onReady]);

  if (modelPath) {
    return (
      <GltfModel
        path={modelPath}
        targetSize={1.35}
        rotation={category === "furniture" ? [0, Math.PI * 0.15, 0] : [0, 0, 0]}
        onLoaded={onReady}
      />
    );
  }

  return <ProductImagePlane image={image} category={category} />;
}

function PreviewMesh(props: ProductPreview3DProps) {
  const ref = useRef<Group>(null);
  const { category } = props;

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;

    if (category === "fruit") {
      g.position.y = Math.sin(t * 2.5) * 0.12;
      g.rotation.y = t * 0.4;
    } else if (category === "electronics") {
      g.rotation.y = t * 0.25;
    } else {
      g.rotation.y = t * 0.2;
    }
  });

  return (
    <group ref={ref}>
      <Suspense fallback={null}>
        <PreviewContent {...props} />
      </Suspense>
    </group>
  );
}

export default function ProductPreview3D(props: ProductPreview3DProps) {
  return (
    <>
      <SceneBackdrop fogFar={16} />
      <SceneLighting preset="night" />

      <PreviewMesh {...props} />

      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}
