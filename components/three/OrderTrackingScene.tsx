"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import type { Group } from "three";
import type { Order } from "@/lib/types";
import { TruckModel } from "@/components/three/TruckModel";
import { BoxBody } from "@/components/three/BoxModel";
import { attachBoxToTruck } from "@/lib/packingConfig";

const STATUS_PROGRESS: Record<Order["status"], number> = {
  placed: 0,
  packing: 0.12,
  packed: 0.35,
  shipped: 0.58,
  out_for_delivery: 0.82,
  delivered: 1,
};

interface OrderTrackingSceneProps {
  status: Order["status"];
}

export default function OrderTrackingScene({ status }: OrderTrackingSceneProps) {
  const truckRef = useRef<Group>(null);
  const boxRef = useRef<Group>(null);
  const attachedRef = useRef(false);
  const target = useMemo(() => STATUS_PROGRESS[status], [status]);
  const progress = useRef(0);

  useFrame((_, delta) => {
    progress.current += (target - progress.current) * delta * 2;
    const truck = truckRef.current;
    const box = boxRef.current;
    if (!truck) return;

    truck.position.x = -4 + progress.current * 10;

    if (box && progress.current > 0.32) {
      box.visible = true;
      if (!attachedRef.current && progress.current > 0.38) {
        attachBoxToTruck(box, truck);
        attachedRef.current = true;
      }
    }
  });

  const showBox = target >= 0.3;

  return (
    <>
      <color attach="background" args={["#07070d"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 4]} intensity={1.2} color="#e0f2fe" />
      <Environment preset="night" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#0f0f18" />
      </mesh>

      <TruckModel ref={truckRef} />

      {showBox && (
        <group ref={boxRef} scale={0.5} visible={false}>
          <BoxBody />
        </group>
      )}
    </>
  );
}
