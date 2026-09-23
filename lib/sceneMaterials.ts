import * as THREE from "three";

export const SCENE_COLORS = {
  bg: "#06060c",
  fog: "#06060c",
  floor: "#12121a",
  key: "#e0f2fe",
  fill: "#c4b5fd",
  accent: "#22d3ee",
  fruit: "#34d399",
  electronics: "#22d3ee",
  furniture: "#a78bfa",
};

export function productMaterial(
  texture: THREE.Texture,
  category: "fruit" | "electronics" | "furniture",
) {
  const base = {
    map: texture,
    roughness: category === "electronics" ? 0.22 : 0.38,
    metalness: category === "electronics" ? 0.35 : 0.08,
    envMapIntensity: 0.85,
  };
  if (category === "electronics") {
    return new THREE.MeshStandardMaterial({
      ...base,
      emissive: new THREE.Color("#22d3ee"),
      emissiveIntensity: 0.08,
    });
  }
  return new THREE.MeshStandardMaterial(base);
}

export function cardboardMaterial() {
  return new THREE.MeshStandardMaterial({ color: "#c9a66b", roughness: 0.82 });
}

export function tapeMaterial() {
  return new THREE.MeshStandardMaterial({
    color: "#f5e6c8",
    emissive: "#f5e6c8",
    emissiveIntensity: 0.12,
    roughness: 0.5,
  });
}
