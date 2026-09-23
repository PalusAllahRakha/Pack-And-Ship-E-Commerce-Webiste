"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group, Mesh, PerspectiveCamera } from "three";
import * as THREE from "three";
import type { AddressType, Category } from "@/lib/types";
import { TruckModel } from "@/components/three/TruckModel";
import { BoxBody } from "@/components/three/BoxModel";
import { DestinationBuilding, WarehouseBuilding } from "@/components/three/DestinationBuilding";
import { ProductShape3D } from "@/components/three/ProductShape3D";
import { SceneBackdrop, SceneLighting } from "@/components/three/SceneLighting";
import { FramedSceneCamera } from "@/components/three/FramedSceneCamera";
import {
  attachBoxToTruck,
  CARGO_ANCHOR_NAME,
  DELIVERY_ROAD,
  getCargoWorldPosition,
  getNamedObject,
} from "@/lib/packingConfig";
import { getPaddedGroundSpan } from "@/lib/sceneViewport";
import { useThemeStore } from "@/store/themeStore";

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export interface DeliveryPackProduct {
  slug: string;
  image: string;
  category: Category;
}

interface DeliveryJourneySceneProps {
  status: string;
  addressType: AddressType;
  packProducts: DeliveryPackProduct[];
  onReachedDestination?: () => void;
}

type LoadPhase = "idle" | "openDoors" | "insertBox" | "closeDoors" | "complete";

const DASH_SPACING = 1.15;
const DOOR_OPEN = Math.PI / 2.15;

const _cargo = new THREE.Vector3();
const _approach = new THREE.Vector3();
const _start = new THREE.Vector3();
const _lerp = new THREE.Vector3();

function ResponsiveTrack({
  children,
}: {
  children: (span: { fromX: number; toX: number; centerX: number; length: number }) => React.ReactNode;
}) {
  const { camera, size } = useThree();
  const sizeKey = `${size.width}x${size.height}`;
  const [span, setSpan] = useState(() =>
    getPaddedGroundSpan(camera as PerspectiveCamera),
  );

  useLayoutEffect(() => {
    const cam = camera as PerspectiveCamera;
    cam.updateMatrixWorld();
    setSpan(getPaddedGroundSpan(cam));
  }, [camera, sizeKey]);

  return <>{children(span)}</>;
}

function RoadDashes({
  scrollRef,
  fromX,
  toX,
}: {
  scrollRef: React.MutableRefObject<number>;
  fromX: number;
  toX: number;
}) {
  const groupRef = useRef<Group>(null);
  const length = toX - fromX;
  const halfLen = length / 2;
  const dashCount = Math.max(18, Math.ceil(length / 0.72));

  useFrame(() => {
    if (!groupRef.current) return;
    const offset = scrollRef.current % DASH_SPACING;
    groupRef.current.children.forEach((dash, i) => {
      const t = i / Math.max(dashCount - 1, 1);
      const baseX = t * length - halfLen;
      let x = baseX - offset;
      while (x < -halfLen) x += length;
      while (x > halfLen) x -= length;
      dash.position.x = x;
    });
  });

  return (
    <group ref={groupRef} position={[(fromX + toX) / 2, 0.028, 0]}>
      {Array.from({ length: dashCount }).map((_, i) => {
        const t = i / Math.max(dashCount - 1, 1);
        const x = t * length - halfLen;
        return (
          <mesh
            key={i}
            position={[x, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.55, 0.06]} />
            <meshStandardMaterial
              color="#fde68a"
              emissive="#fbbf24"
              emissiveIntensity={0.35}
              transparent
              opacity={0.85}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export default function DeliveryJourneyScene({
  status,
  addressType,
  packProducts,
  onReachedDestination,
}: DeliveryJourneySceneProps) {
  const sceneRootRef = useRef<Group>(null);
  const truckRef = useRef<Group>(null);
  const boxRef = useRef<Group>(null);
  const markerRef = useRef<Mesh>(null);
  const attachedRef = useRef(false);
  const driveX = useRef(DELIVERY_ROAD.warehouseX);
  const displayX = useRef(DELIVERY_ROAD.warehouseX);
  const driveSpeed = useRef(0);
  const driveWarmup = useRef(0);
  const dashScroll = useRef(0);
  const deliveredFired = useRef(false);
  const onArrivalRef = useRef(onReachedDestination);
  const loadPhase = useRef<LoadPhase>("idle");
  const loadT = useRef(0);

  useEffect(() => {
    onArrivalRef.current = onReachedDestination;
  }, [onReachedDestination]);

  const { warehouseX, destinationX, arrivalThreshold } = DELIVERY_ROAD;
  const sceneMinX = destinationX - 2.4;
  const sceneMaxX = warehouseX + 2.4;
  const destScale = 0.45;

  const placeBoxOnGround = (wx: number) => {
    const box = boxRef.current;
    const root = sceneRootRef.current;
    if (!box || !root) return;
    if (box.parent?.name === CARGO_ANCHOR_NAME) {
      root.attach(box);
    }
    box.position.set(wx + 0.95, 0.38, 0.12);
    box.rotation.set(0, 0, 0);
    box.scale.set(1, 1, 1);
    box.visible = true;
    attachedRef.current = false;
  };

  const closeDoors = (truck: Group) => {
    const left = getNamedObject(truck, "rearDoorLeft");
    const right = getNamedObject(truck, "rearDoorRight");
    if (left) left.rotation.y = 0;
    if (right) right.rotation.y = 0;
  };

  useEffect(() => {
    deliveredFired.current = false;
    driveSpeed.current = 0;
    driveWarmup.current = 0;
    loadT.current = 0;

    if (status === "delivered") {
      driveX.current = destinationX;
      displayX.current = destinationX;
      loadPhase.current = "complete";
      attachedRef.current = false;
    } else if (status === "out_for_delivery") {
      driveX.current = warehouseX;
      displayX.current = warehouseX;
      loadPhase.current = "openDoors";
      attachedRef.current = false;
      requestAnimationFrame(() => placeBoxOnGround(warehouseX));
    } else if (status === "shipped") {
      driveX.current = warehouseX;
      displayX.current = warehouseX;
      loadPhase.current = "idle";
      attachedRef.current = false;
      requestAnimationFrame(() => placeBoxOnGround(warehouseX));
    } else {
      driveX.current = warehouseX;
      displayX.current = warehouseX;
      loadPhase.current = "idle";
    }
  }, [status, destinationX, warehouseX]);

  const previewProducts = useMemo(() => packProducts, [packProducts]);
  const isDriving = status === "out_for_delivery";
  const atDestination = status === "delivered";
  const isLight = useThemeStore((s) => s.theme) === "light";
  const roadColor = isLight ? "#1e293b" : "#14141c";
  const groundColor = isLight ? "#dbe4ef" : "#0a0a12";
  const markerColor = isLight ? "#059669" : "#34d399";

  useFrame((state, delta) => {
    const truck = truckRef.current;
    const box = boxRef.current;
    const marker = markerRef.current;
    const root = sceneRootRef.current;
    if (!truck) return;

    const dt = Math.min(delta, 0.033);
    const doorLeft = getNamedObject(truck, "rearDoorLeft");
    const doorRight = getNamedObject(truck, "rearDoorRight");

    // ── Cargo load: doors → box in → doors shut ──
    if (loadPhase.current === "openDoors") {
      loadT.current += dt;
      const p = easeInOut(Math.min(loadT.current / 0.7, 1));
      if (doorLeft) doorLeft.rotation.y = p * DOOR_OPEN;
      if (doorRight) doorRight.rotation.y = -p * DOOR_OPEN;
      if (p >= 1) {
        loadPhase.current = "insertBox";
        loadT.current = 0;
      }
    } else if (loadPhase.current === "insertBox" && box && root) {
      loadT.current += dt;
      const p = easeInOut(Math.min(loadT.current / 1.5, 1));

      getCargoWorldPosition(truck, _cargo);
      _approach.copy(_cargo);
      _approach.x += 0.82;
      _approach.y = 0.38;
      _start.set(warehouseX + 0.95, 0.38, 0.12);

      if (box.parent?.name === CARGO_ANCHOR_NAME) root.attach(box);

      if (p < 0.38) {
        const t = easeInOut(p / 0.38);
        _lerp.lerpVectors(_start, _approach, t);
      } else {
        const t = easeInOut((p - 0.38) / 0.62);
        _lerp.lerpVectors(_approach, _cargo, t);
        _lerp.y = 0.38 + Math.sin(t * Math.PI) * 0.12;
      }

      box.position.copy(_lerp);

      if (p >= 1) {
        attachBoxToTruck(box, truck);
        attachedRef.current = true;
        loadPhase.current = "closeDoors";
        loadT.current = 0;
      }
    } else if (loadPhase.current === "closeDoors") {
      loadT.current += dt;
      const p = easeInOut(Math.min(loadT.current / 0.6, 1));
      if (doorLeft) doorLeft.rotation.y = (1 - p) * DOOR_OPEN;
      if (doorRight) doorRight.rotation.y = -(1 - p) * DOOR_OPEN;
      if (p >= 1) {
        closeDoors(truck);
        loadPhase.current = "complete";
        loadT.current = 0;
      }
    }

    // ── Drive after load completes ──
    const canDrive = loadPhase.current === "complete" && isDriving;

    if (canDrive) {
      driveWarmup.current = Math.min(1, driveWarmup.current + dt * 0.55);
      const distRemaining = driveX.current - destinationX;
      const easeOut =
        distRemaining < 1.8
          ? THREE.MathUtils.clamp(distRemaining / 1.8, 0.12, 1)
          : 1;
      const cruise = DELIVERY_ROAD.driveSpeed * 0.82;
      const desired = cruise * driveWarmup.current * easeOut;
      driveSpeed.current = THREE.MathUtils.damp(driveSpeed.current, desired, 1.6, dt);

      driveX.current -= driveSpeed.current * dt;
      dashScroll.current += driveSpeed.current * dt * 0.9;

      if (driveX.current <= destinationX) {
        driveX.current = destinationX;
        driveSpeed.current = 0;
        if (!deliveredFired.current && status === "out_for_delivery") {
          deliveredFired.current = true;
          onArrivalRef.current?.();
        }
      }
    } else {
      driveWarmup.current = 0;
    }

    if (atDestination) {
      driveX.current = destinationX;
      driveSpeed.current = 0;
      if (box && !attachedRef.current) {
        attachBoxToTruck(box, truck);
        attachedRef.current = true;
      }
      closeDoors(truck);
    } else if (status === "shipped") {
      driveX.current = warehouseX;
      driveSpeed.current = 0;
    }

    displayX.current = THREE.MathUtils.damp(
      displayX.current,
      driveX.current,
      3.5,
      dt,
    );

    truck.position.set(displayX.current, 0, 0);
    truck.rotation.x = 0;
    truck.rotation.z = 0;

    if (marker) {
      const atDest = atDestination || driveX.current <= destinationX + arrivalThreshold;
      const mat = marker.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = atDest ? 0.7 + Math.sin(state.clock.elapsedTime * 5) * 0.25 : 0.35;
    }
  });

  return (
    <group ref={sceneRootRef}>
      <FramedSceneCamera
        bounds={{ minX: sceneMinX, maxX: sceneMaxX, maxY: 2.4 }}
        lookAtY={0.5}
      />
      <SceneBackdrop fogFar={26} variant={isLight ? "light" : "dark"} />
      <SceneLighting preset={isLight ? "city" : "night"} intensity={isLight ? 1.05 : 0.95} />

      <ResponsiveTrack>
        {(span) => (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[span.centerX, 0.012, 0]} receiveShadow>
              <planeGeometry args={[span.length, 2.4]} />
              <meshStandardMaterial color={groundColor} roughness={0.95} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[span.centerX, 0.02, 0]} receiveShadow>
              <planeGeometry args={[span.length, 1.1]} />
              <meshStandardMaterial color={roadColor} roughness={0.9} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[span.centerX, 0.024, 0]}>
              <planeGeometry args={[span.length, 0.1]} />
              <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.2} />
            </mesh>
            <RoadDashes scrollRef={dashScroll} fromX={span.fromX} toX={span.toX} />
          </>
        )}
      </ResponsiveTrack>

      <group position={[warehouseX, 0, 0]}>
        <WarehouseBuilding scale={0.42} />
      </group>

      <group position={[destinationX, 0, 0]}>
        <DestinationBuilding type={addressType} scale={destScale} />
        <mesh ref={markerRef} position={[0, 0.045, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.46, 32]} />
          <meshStandardMaterial
            color={markerColor}
            emissive={markerColor}
            emissiveIntensity={atDestination ? 0.65 : 0.3}
            transparent
            opacity={isLight ? 0.85 : 0.7}
          />
        </mesh>
      </group>

      <group ref={boxRef} visible>
        <BoxBody />
        <group position={[0, 0.42, 0.15]}>
          {previewProducts.map((product, i) => {
            const n = previewProducts.length;
            const cols = Math.min(n, 3);
            const row = Math.floor(i / cols);
            const col = i % cols;
            const x = (col - (cols - 1) / 2) * 0.22;
            const z = row * 0.1;
            return (
              <group
                key={`${product.slug}-${i}`}
                position={[x, 0, z]}
                rotation={[0, i * 0.45, 0]}
              >
                <ProductShape3D
                  slug={product.slug}
                  image={product.image}
                  category={product.category}
                  size="preview"
                />
              </group>
            );
          })}
        </group>
      </group>

      <TruckModel ref={truckRef} />
    </group>
  );
}
