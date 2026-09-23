"use client";

import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Category } from "@/lib/types";
import { getProductImageFallback } from "@/lib/productImage";

interface ProductImagePlaneProps {
  image: string;
  category?: Category;
  width?: number;
  height?: number;
  depth?: number;
}

function applyCoverTexture(
  texture: THREE.Texture,
  imageWidth: number,
  imageHeight: number,
  planeWidth: number,
  planeHeight: number,
) {
  const imageAspect = imageWidth / imageHeight;
  const planeAspect = planeWidth / planeHeight;

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  if (imageAspect > planeAspect) {
    const scale = planeAspect / imageAspect;
    texture.repeat.set(scale, 1);
    texture.offset.set((1 - scale) / 2, 0);
  } else {
    const scale = imageAspect / planeAspect;
    texture.repeat.set(1, scale);
    texture.offset.set(0, (1 - scale) / 2);
  }
}

export function ProductImagePlane({
  image,
  category,
  width = 1.35,
  height = 1.35,
  depth = 0.1,
}: ProductImagePlaneProps) {
  const src = image || (category ? getProductImageFallback(category) : image);
  const texture = useTexture(src);

  const faceW = width * 0.9;
  const faceH = height * 0.9;

  useEffect(() => {
    const img = texture.image as HTMLImageElement | undefined;
    if (!img?.width || !img?.height) return;
    applyCoverTexture(texture, img.width, img.height, faceW, faceH);
  }, [texture, faceW, faceH]);

  const materials = useMemo(
    () => ({
      front: new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.32,
        metalness: 0.04,
      }),
      shine: new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
      }),
    }),
    [texture],
  );

  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#18181f" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, depth / 2 + 0.008]} castShadow material={materials.front}>
        <planeGeometry args={[faceW, faceH]} />
      </mesh>
      <mesh position={[0, 0, depth / 2 + 0.012]} material={materials.shine}>
        <planeGeometry args={[faceW, faceH]} />
      </mesh>
    </group>
  );
}
