"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";
import type { Category } from "@/lib/types";
import { SCENE_COLORS } from "@/lib/sceneMaterials";
import { HERO_CYCLE_SEC } from "@/lib/heroCycle";
import { getCategoryShowcaseModel } from "@/lib/showcaseModels";
import { MODEL_PATHS } from "@/lib/models";
import { GltfModel, preloadGltfModel } from "@/components/three/GltfModel";
import { SceneLighting } from "@/components/three/SceneLighting";
import { useThemeStore } from "@/store/themeStore";

const CATEGORIES: Category[] = ["fruit", "electronics", "furniture"];
const FADE_SEC = 0.6;

const CATEGORY_COLORS: Record<Category, string> = {
  fruit: SCENE_COLORS.fruit,
  electronics: SCENE_COLORS.electronics,
  furniture: SCENE_COLORS.furniture,
};

const CATEGORY_TARGET_SIZE: Record<Category, number> = {
  fruit: 1.1,
  electronics: 1.35,
  furniture: 1.15,
};

interface HeroSceneProps {
  parallax?: { x: number; y: number };
  activeCategory?: Category;
  onCategoryChange?: (category: Category) => void;
  onSceneReady?: () => void;
  paused?: boolean;
}

function applyGroupOpacity(group: Group, opacity: number) {
  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    for (const mat of mats) {
      if (!(mat instanceof THREE.Material)) continue;
      if (mat.userData.heroBaseOpacity === undefined) {
        mat.userData.heroBaseOpacity = mat.opacity ?? 1;
        mat.transparent = true;
      }
      const next = mat.userData.heroBaseOpacity * opacity;
      if (Math.abs(mat.opacity - next) > 0.002) {
        mat.opacity = next;
      }
    }
  });
}

function CategoryShowcase({
  category,
  opacityRef,
  parallax,
  fadeOut = false,
  paused = false,
  onLoaded,
}: {
  category: Category;
  opacityRef: React.MutableRefObject<number>;
  parallax: { x: number; y: number };
  fadeOut?: boolean;
  paused?: boolean;
  onLoaded?: () => void;
}) {
  const groupRef = useRef<Group>(null);
  const modelPath = getCategoryShowcaseModel(category);
  const lastOpacity = useRef(-1);

  useFrame((state) => {
    if (paused) return;
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const opacity = opacityRef.current;
    const scale = fadeOut ? 1 + (1 - opacity) * 0.05 : 0.9 + opacity * 0.1;

    g.position.x = parallax.x * 0.35;
    g.position.y = parallax.y * 0.12 + (category === "fruit" ? Math.sin(t * 2.2) * 0.06 : 0);
    g.rotation.y = t * 0.35;
    g.scale.setScalar(scale);

    const fading = fadeOut || opacity < 0.995;
    if (fading || Math.abs(opacity - lastOpacity.current) > 0.002) {
      lastOpacity.current = opacity;
      applyGroupOpacity(g, opacity);
    }
  });

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <GltfModel
          path={modelPath}
          targetSize={CATEGORY_TARGET_SIZE[category]}
          rotation={category === "furniture" ? [0, Math.PI * 0.12, 0] : [0, 0, 0]}
          onLoaded={onLoaded}
        />
      </Suspense>
    </group>
  );
}

function CameraRig({
  parallax,
  paused,
}: {
  parallax: { x: number; y: number };
  paused?: boolean;
}) {
  useFrame((state) => {
    if (paused) return;
    const { camera } = state;
    const t = state.clock.elapsedTime * 0.12;
    camera.position.x = Math.sin(t) * 0.4 + parallax.x * 0.5;
    camera.position.y = 1.2 + parallax.y * 0.25;
    camera.position.z = 5.5 + Math.cos(t) * 0.2;
    camera.lookAt(parallax.x * 0.2, 0, 0);
  });
  return null;
}

export default function HeroScene({
  parallax = { x: 0, y: 0 },
  activeCategory,
  onCategoryChange,
  onSceneReady,
  paused = false,
}: HeroSceneProps) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const fadeRef = useRef(1);
  const incomingOpacityRef = useRef(1);
  const outgoingOpacityRef = useRef(0);
  const ringRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<THREE.Mesh>(null);
  const fromColorRef = useRef(new THREE.Color(CATEGORY_COLORS[CATEGORIES[0]!]));
  const toColorRef = useRef(new THREE.Color(CATEGORY_COLORS[CATEGORIES[0]!]));
  const blendColorRef = useRef(new THREE.Color(CATEGORY_COLORS[CATEGORIES[0]!]));
  const sceneReadySent = useRef(false);

  const category = CATEGORIES[categoryIndex]!;
  const theme = useThemeStore((s) => s.theme);
  const isLight = theme === "light";
  const platformColor = isLight ? "#dbe4ef" : "#14141f";
  const ringOpacity = isLight ? 0.55 : 0.35;
  const ringEmissive = isLight ? 0.45 : 0.25;

  const handleModelLoaded = useCallback(() => {
    if (sceneReadySent.current) return;
    sceneReadySent.current = true;
    onSceneReady?.();
  }, [onSceneReady]);

  useEffect(() => {
    fromColorRef.current.copy(toColorRef.current);
    toColorRef.current.set(CATEGORY_COLORS[category]);
  }, [category]);

  useEffect(() => {
    if (prevIndex === null) {
      onCategoryChange?.(category);
    }
  }, [category, prevIndex, onCategoryChange]);

  useEffect(() => {
    if (!activeCategory) return;
    const idx = CATEGORIES.indexOf(activeCategory);
    if (idx < 0) return;

    setCategoryIndex((current) => {
      if (current === idx) return current;
      setPrevIndex(current);
      fadeRef.current = 0;
      incomingOpacityRef.current = 0;
      outgoingOpacityRef.current = 1;
      return idx;
    });
  }, [activeCategory]);

  useEffect(() => {
    if (paused) return;

    const tick = () => {
      setCategoryIndex((current) => {
        setPrevIndex(current);
        fadeRef.current = 0;
        incomingOpacityRef.current = 0;
        outgoingOpacityRef.current = 1;
        return (current + 1) % CATEGORIES.length;
      });
    };

    let id: number | null = null;

    const start = () => {
      if (id) return;
      id = window.setInterval(tick, HERO_CYCLE_SEC * 1000);
    };

    const stop = () => {
      if (id !== null) {
        window.clearInterval(id);
        id = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
      else start();
    };

    if (document.visibilityState !== "hidden") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paused, activeCategory]);

  useFrame((_, delta) => {
    if (paused) return;

    if (prevIndex !== null && fadeRef.current < 1) {
      fadeRef.current = Math.min(1, fadeRef.current + delta / FADE_SEC);
      incomingOpacityRef.current = fadeRef.current;
      outgoingOpacityRef.current = 1 - fadeRef.current;
      if (fadeRef.current >= 1) {
        setPrevIndex(null);
        outgoingOpacityRef.current = 0;
      }
    }

    blendColorRef.current.copy(fromColorRef.current).lerp(toColorRef.current, fadeRef.current);
    const blend = blendColorRef.current;
    const ring = ringRef.current;
    if (ring?.material instanceof THREE.MeshStandardMaterial) {
      ring.material.color.copy(blend);
      ring.material.emissive.copy(blend);
    }
    const textMat = textRef.current?.material;
    if (textMat && "color" in textMat && textMat.color instanceof THREE.Color) {
      textMat.color.copy(blend);
      if ("fillOpacity" in textMat && typeof textMat.fillOpacity === "number") {
        textMat.fillOpacity = 0.55 + fadeRef.current * 0.45;
      }
    }
  });

  return (
    <>
      <SceneLighting preset="city" />

      <CameraRig parallax={parallax} paused={paused} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} receiveShadow>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial
          color={platformColor}
          metalness={isLight ? 0.15 : 0.35}
          roughness={isLight ? 0.92 : 0.8}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.73, 0]}>
        <ringGeometry args={[0.82, 0.98, 32]} />
        <meshStandardMaterial
          color={CATEGORY_COLORS[category]}
          emissive={CATEGORY_COLORS[category]}
          emissiveIntensity={ringEmissive}
          transparent
          opacity={ringOpacity}
        />
      </mesh>

      {prevIndex !== null && (
        <CategoryShowcase
          category={CATEGORIES[prevIndex]!}
          opacityRef={outgoingOpacityRef}
          parallax={parallax}
          paused={paused}
          fadeOut
        />
      )}
      <CategoryShowcase
        category={category}
        opacityRef={incomingOpacityRef}
        parallax={parallax}
        paused={paused}
        onLoaded={handleModelLoaded}
      />

      <Text
        ref={textRef}
        position={[0, -0.35, 0.75]}
        fontSize={0.11}
        color={CATEGORY_COLORS[category]}
        anchorX="center"
        fillOpacity={1}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)} showcase
      </Text>
    </>
  );
}

// Preload hero showcase models
preloadGltfModel(MODEL_PATHS.fruit);
preloadGltfModel(MODEL_PATHS.headphones);
preloadGltfModel(MODEL_PATHS.furniture);
