"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { PackingBoxAssembly, FLAP_NAMES } from "@/components/three/PackingBoxAssembly";
import { TruckModel } from "@/components/three/TruckModel";
import type { PackItemData } from "@/components/three/PackItems";
import { SceneBackdrop, SceneLighting } from "@/components/three/SceneLighting";
import {
  PackingCameraRig,
  PACKING_CAMERA_BOX_TOP,
  PACKING_CAMERA_TRUCK,
  PACKING_CAMERA_WIDE,
  type CameraRigState,
} from "@/components/three/PackingCameraRig";
import {
  ITEM_OFFSETS,
  PACKING_CONFIG,
  attachBoxToTruck,
  getCargoWorldPosition,
  getNamedObject,
} from "@/lib/packingConfig";

export const PACKING_STAGES = [
  "boxErects",
  "itemsEnter",
  "flapsClose",
  "tapeSeal",
  "truckArrives",
  "doorsOpen",
  "boxLoads",
  "doorsClose",
  "truckDeparts",
  "deliveryPopup",
] as const;

export type PackingStage = (typeof PACKING_STAGES)[number];

export const STAGE_LABELS: Record<PackingStage, string> = {
  boxErects: "Erecting shipping box…",
  itemsEnter: "Placing products inside…",
  flapsClose: "Closing flaps…",
  tapeSeal: "Sealing box…",
  truckArrives: "Delivery truck arriving…",
  doorsOpen: "Opening cargo doors…",
  boxLoads: "Loading package inside…",
  doorsClose: "Securing cargo doors…",
  truckDeparts: "Heading out for delivery…",
  deliveryPopup: "Shipped!",
};

export interface PackingSequenceHandle {
  skip: () => void;
}

interface PackingSequenceSceneProps {
  packItems: PackItemData[];
  onComplete?: () => void;
  onStageChange?: (stage: PackingStage) => void;
}

const FALLBACK_ITEMS: PackItemData[] = [
  {
    slug: "honeycrisp-apples",
    image: "/images/products/honeycrisp-apples.jpg",
    category: "fruit",
    packStyle: "soft-drop",
  },
  {
    slug: "wireless-earbuds",
    image: "/images/products/wireless-earbuds.jpg",
    category: "electronics",
    packStyle: "bubble-wrap",
  },
];

const DOOR_OPEN = Math.PI / 2.15;

function getItemRestPosition(index: number, count: number): [number, number, number] {
  if (count === 1) return [0, 0, 0];
  const [x, , z] = ITEM_OFFSETS[index] ?? [0, 0, 0];
  return [x, 0, z];
}

function applyRig(rig: CameraRigState, preset: CameraRigState) {
  rig.px = preset.px;
  rig.py = preset.py;
  rig.pz = preset.pz;
  rig.lx = preset.lx;
  rig.ly = preset.ly;
  rig.lz = preset.lz;
  rig.fov = preset.fov;
}

const PackingSequenceScene = forwardRef<
  PackingSequenceHandle,
  PackingSequenceSceneProps
>(function PackingSequenceScene(
  { packItems, onComplete, onStageChange },
  ref,
) {
  const rootRef = useRef<Group>(null);
  const boxRef = useRef<Group>(null);
  const itemsRef = useRef<Group>(null);
  const truckRef = useRef<Group>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const startedRef = useRef(false);
  const cameraRig = useRef<CameraRigState>({ ...PACKING_CAMERA_WIDE });
  const onCompleteRef = useRef(onComplete);
  const onStageChangeRef = useRef(onStageChange);
  const [sceneReady, setSceneReady] = useState(false);
  const [itemsLayoutReady, setItemsLayoutReady] = useState(false);

  const items = packItems.length > 0 ? packItems : FALLBACK_ITEMS;
  const packSignature = useMemo(
    () => items.map((item, i) => `${i}:${item.slug}`).join("|"),
    [items],
  );

  useEffect(() => {
    setItemsLayoutReady(false);
    setSceneReady(false);
    startedRef.current = false;
    timelineRef.current?.kill();
    timelineRef.current = null;
  }, [packSignature]);

  const handleItemsLayout = useCallback(() => {
    setItemsLayoutReady(true);
  }, []);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onStageChangeRef.current = onStageChange;
  }, [onComplete, onStageChange]);

  useImperativeHandle(ref, () => ({
    skip: () => {
      timelineRef.current?.progress(1);
      if (itemsRef.current) itemsRef.current.visible = false;
    },
  }));

  useLayoutEffect(() => {
    let attempts = 0;
    let frameId = 0;
    const check = () => {
      attempts += 1;
      if (boxRef.current && itemsRef.current && truckRef.current) {
        setSceneReady(true);
        return;
      }
      if (attempts < 90) frameId = requestAnimationFrame(check);
    };
    frameId = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frameId);
  }, [packSignature]);

  useGSAP(
    () => {
      if (!sceneReady || !itemsLayoutReady || startedRef.current) return;

      const box = boxRef.current!;
      const packGroup = itemsRef.current!;
      const truck = truckRef.current!;
      const itemGroups = packGroup.children as Group[];
      const flaps = FLAP_NAMES.map((n) => getNamedObject(box, n)!);
      const tapeTrail = getNamedObject(box, "tapeTrail") as Mesh;
      const doorLeft = getNamedObject(truck, "rearDoorLeft")!;
      const doorRight = getNamedObject(truck, "rearDoorRight")!;
      const rearApproach = new THREE.Vector3();
      const rig = cameraRig.current;

      startedRef.current = true;
      const notify = (s: PackingStage) => onStageChangeRef.current?.(s);
      const cargo = new THREE.Vector3();
      const loadTarget = new THREE.Vector3();

      box.rotation.set(-Math.PI / 2, 0, 0);
      box.position.set(0, 0.04, 0);
      box.scale.set(1, 1, 1);
      itemGroups.forEach((g, i) => {
        g.position.set(0, 3.4 + i * 0.32, 0);
        g.scale.set(0.35, 0.35, 0.35);
      });
      packGroup.visible = true;
      tapeTrail.scale.set(0, 1, 1);
      tapeTrail.visible = false;
      truck.position.set(PACKING_CONFIG.truckEnterX, PACKING_CONFIG.truckY, 0);
      truck.visible = false;
      applyRig(rig, PACKING_CAMERA_WIDE);

      const tl = gsap.timeline({
        delay: 0.4,
        onComplete: () => {
          notify("deliveryPopup");
          onCompleteRef.current?.();
        },
      });
      timelineRef.current = tl;

      // 1 — Flat box erects (wide shot)
      tl.addLabel("boxErects")
        .call(() => notify("boxErects"))
        .to(box.rotation, { x: 0, duration: 1.1, ease: "back.out(1.3)" })
        .to(box.position, { y: PACKING_CONFIG.boxRestY, duration: 1.1, ease: "power2.out" }, "<");

      // 2 — Top-down on box + items drop in
      tl.addLabel("itemsEnter")
        .call(() => notify("itemsEnter"))
        .to(rig, { ...PACKING_CAMERA_BOX_TOP, duration: 0.9, ease: "power2.inOut" }, "itemsEnter");

      itemGroups.forEach((g, i) => {
        const [tx, ty, tz] = getItemRestPosition(i, itemGroups.length);
        const at = `itemsEnter+=${0.3 + i * 0.32}`;
        tl.to(g.position, { x: tx, y: ty, z: tz, duration: 0.9, ease: "power3.inOut" }, at);
        tl.to(g.scale, { x: 1, y: 1, z: 1, duration: 0.75, ease: "back.out(1.2)" }, at);
      });

      // 3 — Flaps close (top-down); hide items once box is shut
      tl.addLabel("flapsClose").call(() => {
        notify("flapsClose");
        packGroup.visible = false;
      });
      const flapTargets = [{ x: 0 }, { x: 0 }, { z: 0 }, { z: 0 }];
      flaps.forEach((flap, i) => {
        tl.to(
          flap.rotation,
          { ...flapTargets[i], duration: 0.5, ease: "back.out(1.1)" },
          i === 0 ? "flapsClose" : ">-0.18",
        );
      });

      // 4 — Long tape strip seals the box (no small tape runner)
      tl.addLabel("tapeSeal")
        .call(() => {
          notify("tapeSeal");
          tapeTrail.visible = true;
        })
        .fromTo(
          tapeTrail.scale,
          { x: 0.01 },
          { x: 1, duration: 1.0, ease: "power2.out" },
          "tapeSeal",
        );

      // 5 — Pull back to side view + truck arrives
      tl.addLabel("truckArrives")
        .call(() => notify("truckArrives"))
        .set(truck, { visible: true })
        .to(rig, { ...PACKING_CAMERA_TRUCK, fov: 42, duration: 1.1, ease: "power2.inOut" }, "truckArrives")
        .fromTo(
          truck.position,
          { x: PACKING_CONFIG.truckEnterX },
          { x: PACKING_CONFIG.truckParkX, duration: 2, ease: "power2.out" },
          "truckArrives+=0.15",
        );

      // 7 — Open doors (no pause)
      tl.addLabel("doorsOpen")
        .call(() => notify("doorsOpen"))
        .to(doorLeft.rotation, { y: DOOR_OPEN, duration: 0.5, ease: "back.out(1.4)" }, "doorsOpen")
        .to(doorRight.rotation, { y: -DOOR_OPEN, duration: 0.5, ease: "back.out(1.4)" }, "doorsOpen");

      // 8 — Load box through rear
      tl.addLabel("boxLoads").call(() => {
        notify("boxLoads");
        getCargoWorldPosition(truck, cargo);
        loadTarget.copy(cargo);
        rearApproach.copy(cargo);
        rearApproach.x += 0.85;
        rearApproach.y = PACKING_CONFIG.boxRestY;
        rearApproach.z = box.position.z;
      });
      tl.to(box.position, { y: PACKING_CONFIG.boxRestY + 0.15, duration: 0.3, ease: "power2.out" }, "boxLoads")
        .to(
          box.position,
          { x: rearApproach.x, z: rearApproach.z, duration: 0.65, ease: "power2.inOut" },
          ">0.04",
        )
        .to(
          box.position,
          { x: () => loadTarget.x, z: () => loadTarget.z, duration: 1, ease: "power2.inOut" },
          ">0.06",
        )
        .to(box.position, { y: () => loadTarget.y, duration: 0.4, ease: "bounce.out" }, ">0.04")
        .call(() => attachBoxToTruck(box, truck));

      // 9 — Close doors immediately
      tl.addLabel("doorsClose")
        .call(() => notify("doorsClose"))
        .to(doorLeft.rotation, { y: 0, duration: 0.45, ease: "power2.inOut" }, "doorsClose")
        .to(doorRight.rotation, { y: 0, duration: 0.45, ease: "power2.inOut" }, "doorsClose");

      // 10 — Drive away continuously; camera follows until truck leaves view
      tl.addLabel("truckDeparts")
        .call(() => notify("truckDeparts"))
        .to(truck.position, {
          x: PACKING_CONFIG.truckExitX,
          duration: 4.5,
          ease: "power1.in",
          onUpdate: () => {
            const tx = truck.position.x;
            rig.px = tx * 0.55;
            rig.pz = 8.5 + Math.min(3.5, Math.abs(tx) * 0.22);
            rig.lx = tx * 0.4;
            rig.ly = 0.45;
            rig.fov = 42;
          },
        }, "truckDeparts");

      return () => {
        tl.kill();
        startedRef.current = false;
        timelineRef.current = null;
      };
    },
    { scope: rootRef, dependencies: [sceneReady, itemsLayoutReady] },
  );

  return (
    <group ref={rootRef}>
      <PackingCameraRig rigRef={cameraRig} />
      <SceneBackdrop />
      <SceneLighting preset="city" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#12121a" metalness={0.15} roughness={0.85} />
      </mesh>

      <PackingBoxAssembly
        ref={boxRef}
        items={items}
        itemsRef={itemsRef}
        onItemsLayout={handleItemsLayout}
      />
      <TruckModel ref={truckRef} />
    </group>
  );
});

export default PackingSequenceScene;
