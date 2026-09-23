import type { PerspectiveCamera } from "three";
import * as THREE from "three";

const _ndc = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _hit = new THREE.Vector3();
const _plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _ray = new THREE.Ray();

/** Horizontal world span visible on the ground plane at the given Y. */
export function getVisibleGroundSpanX(
  camera: PerspectiveCamera,
  groundY = 0.024,
): [number, number] {
  _plane.constant = -groundY;
  let minX = Infinity;
  let maxX = -Infinity;

  for (const ndcY of [0.15, 0.35, 0.55]) {
    for (const ndcX of [-1, 1] as const) {
      _ndc.set(ndcX, ndcY, 0.5);
      _ndc.unproject(camera);
      _dir.copy(_ndc).sub(camera.position).normalize();
      _ray.set(camera.position, _dir);
      if (_ray.intersectPlane(_plane, _hit)) {
        minX = Math.min(minX, _hit.x);
        maxX = Math.max(maxX, _hit.x);
      }
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return [-8, 8];
  return [minX, maxX];
}

export function getPaddedGroundSpan(
  camera: PerspectiveCamera,
  groundY = 0.024,
  bleed = 0.35,
): { fromX: number; toX: number; centerX: number; length: number } {
  const [minX, maxX] = getVisibleGroundSpanX(camera, groundY);
  const fromX = minX - bleed;
  const toX = maxX + bleed;
  return {
    fromX,
    toX,
    centerX: (fromX + toX) / 2,
    length: toX - fromX,
  };
}
