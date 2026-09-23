import type gsap from "gsap";
import * as THREE from "three";

export const CARGO_ANCHOR_NAME = "cargoAnchor";

export const PACKING_CONFIG = {
  truckParkX: 2.2,
  truckExitX: -16,
  truckY: 0,
  truckEnterX: 6,
  boxRestY: 0.38,
};

/** Road runs right → left; truck delivers at the left marker */
export const DELIVERY_ROAD = {
  warehouseX: 4.5,
  destinationX: -4.5,
  arrivalThreshold: 0.35,
  driveSpeed: 1.15,
};

export function getNamedObject(root: THREE.Object3D, name: string) {
  return root.getObjectByName(name) ?? null;
}

export const ITEM_OFFSETS: [number, number, number][] = [
  [0, 0, 0],
  [0.18, 0, -0.18],
  [-0.18, 0, 0.18],
  [0.18, 0, 0.18],
  [-0.18, 0, -0.18],
  [0, 0, -0.18],
];

/** Usable space inside the erected shipping box (walls 0.92 × 0.48 tall). */
export const BOX_INTERIOR = {
  width: 0.76,
  depth: 0.76,
  height: 0.36,
  floorY: 0.04,
};

export function fitPackItemToBox(group: THREE.Object3D, layoutFactor = 1) {
  const root = group as THREE.Group;
  root.scale.setScalar(1);
  root.position.set(0, 0, 0);
  root.updateWorldMatrix(true, true);

  const bounds = new THREE.Box3().setFromObject(root);
  if (bounds.isEmpty()) {
    return { scale: 1, yOffset: BOX_INTERIOR.floorY };
  }

  const size = bounds.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1e-4);
  const limit = Math.min(
    BOX_INTERIOR.width * 0.9 * layoutFactor,
    BOX_INTERIOR.depth * 0.9 * layoutFactor,
    BOX_INTERIOR.height * 0.92 * layoutFactor,
  );
  const scale = limit / maxDim;
  root.scale.setScalar(scale);
  root.updateWorldMatrix(true, true);

  const fitted = new THREE.Box3().setFromObject(root);
  const yOffset = BOX_INTERIOR.floorY - fitted.min.y + 0.01;
  root.position.y = yOffset;

  return { scale, yOffset };
}

export function getCargoAnchor(truckRoot: THREE.Object3D) {
  return truckRoot.getObjectByName(CARGO_ANCHOR_NAME) ?? null;
}

export function getCargoWorldPosition(
  truckRoot: THREE.Object3D,
  out = new THREE.Vector3(),
) {
  const anchor = getCargoAnchor(truckRoot);
  if (anchor) {
    anchor.getWorldPosition(out);
    return out;
  }
  out.set(0, PACKING_CONFIG.boxRestY, 0);
  return out;
}

export function attachBoxToTruck(box: THREE.Object3D, truckRoot: THREE.Object3D) {
  const anchor = getCargoAnchor(truckRoot);
  if (!anchor) return;
  anchor.attach(box);
  box.position.set(0, 0, 0);
  box.rotation.set(0, 0, 0);
  box.scale.set(1, 1, 1);
}

export function bezierPoint(
  t: number,
  start: THREE.Vector3,
  control: THREE.Vector3,
  end: THREE.Vector3,
  out = new THREE.Vector3(),
) {
  const u = 1 - t;
  out.set(
    u * u * start.x + 2 * u * t * control.x + t * t * end.x,
    u * u * start.y + 2 * u * t * control.y + t * t * end.y,
    u * u * start.z + 2 * u * t * control.z + t * t * end.z,
  );
  return out;
}

export function animateAlongBezier(
  object: THREE.Object3D,
  start: THREE.Vector3,
  control: THREE.Vector3,
  end: THREE.Vector3,
  duration: number,
  ease: string,
  timeline: gsap.core.Timeline,
  position?: string,
) {
  const progress = { t: 0 };
  const pos = new THREE.Vector3();
  return timeline.to(
    progress,
    {
      t: 1,
      duration,
      ease,
      onUpdate: () => {
        bezierPoint(progress.t, start, control, end, pos);
        object.position.copy(pos);
      },
    },
    position,
  );
}
