import { useGLTF, useTexture } from "@react-three/drei";

export const MODEL_PATHS = {
  truck: "/models/truck.glb",
  box: "/models/box.glb",
  fruit: "/models/fruit.glb",
  headphones: "/models/headphones.glb",
  furniture: "/models/furniture.glb",
} as const;

export function preloadPackingModels() {
  useGLTF.preload(MODEL_PATHS.truck);
  useGLTF.preload(MODEL_PATHS.box);
}

export function preloadPackTextures(images: string[]) {
  [...new Set(images)].forEach((url) => useTexture.preload(url));
}

export function preloadShowcaseModels() {
  useGLTF.preload(MODEL_PATHS.fruit);
  useGLTF.preload(MODEL_PATHS.headphones);
  useGLTF.preload(MODEL_PATHS.furniture);
}
