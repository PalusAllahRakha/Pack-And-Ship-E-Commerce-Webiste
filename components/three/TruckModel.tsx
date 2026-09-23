"use client";

import { forwardRef, useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";
import { MODEL_PATHS } from "@/lib/models";
import { CARGO_ANCHOR_NAME } from "@/lib/packingConfig";

const GROUND_CLEARANCE = 0.045;
const DOOR_PANEL = { w: 0.03, h: 0.82, d: 0.46 } as const;

interface TruckModelProps {
  cargoRef?: React.Ref<Group>;
}

function RearDoors() {
  const doorMat = (
    <meshStandardMaterial color="#e4e4ea" metalness={0.35} roughness={0.45} />
  );

  return (
    <group name="rearDoors" position={[-0.44, 0.52, 0]}>
      <group name="rearDoorLeft" position={[0, 0, DOOR_PANEL.d / 2]}>
        <mesh position={[0, DOOR_PANEL.h / 2, 0]} castShadow>
          <boxGeometry args={[DOOR_PANEL.w, DOOR_PANEL.h, DOOR_PANEL.d]} />
          {doorMat}
        </mesh>
      </group>
      <group name="rearDoorRight" position={[0, 0, -DOOR_PANEL.d / 2]}>
        <mesh position={[0, DOOR_PANEL.h / 2, 0]} castShadow>
          <boxGeometry args={[DOOR_PANEL.w, DOOR_PANEL.h, DOOR_PANEL.d]} />
          {doorMat}
        </mesh>
      </group>
    </group>
  );
}

function alignBodyToGround(body: Group, meshRoot: Group) {
  body.position.y = 0;
  body.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3().setFromObject(meshRoot);
  if (bounds.isEmpty()) return;
  body.position.y += GROUND_CLEARANCE - bounds.min.y;
}

export const TruckModel = forwardRef<Group, TruckModelProps>(function TruckModel(
  { cargoRef },
  ref,
) {
  const { scene } = useGLTF(MODEL_PATHS.truck);
  const truck = useMemo(() => scene.clone(), [scene]);
  const bodyRef = useRef<Group>(null);
  const meshRef = useRef<Group>(null);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    const meshRoot = meshRef.current;
    if (!body || !meshRoot) return;
    alignBodyToGround(body, meshRoot);
  }, [truck]);

  return (
    <group ref={ref}>
      <group
        ref={bodyRef}
        name="truckBody"
        rotation={[0, -Math.PI / 2, 0]}
        scale={0.5}
      >
        <group ref={meshRef}>
          <primitive object={truck} />
        </group>
        <group ref={cargoRef} name={CARGO_ANCHOR_NAME} position={[-0.28, 0.92, 0.22]}>
          <mesh visible={false}>
            <boxGeometry args={[0.35, 0.2, 0.35]} />
          </mesh>
        </group>
        <RearDoors />
      </group>
    </group>
  );
});

useGLTF.preload(MODEL_PATHS.truck);
