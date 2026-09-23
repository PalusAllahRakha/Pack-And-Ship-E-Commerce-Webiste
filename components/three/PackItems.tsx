"use client";

import { useLayoutEffect, useRef } from "react";
import type { Group } from "three";
import type { Category } from "@/lib/types";
import { ITEM_OFFSETS, fitPackItemToBox } from "@/lib/packingConfig";
import { MAX_PACK_VISUAL_ITEMS } from "@/lib/packItemsFromOrder";
import { ProductShape3D } from "@/components/three/ProductShape3D";

export interface PackItemData {
  slug: string;
  image: string;
  category: Category;
  packStyle: "soft-drop" | "bubble-wrap" | "disassembled";
}

interface PackItemsProps {
  items: PackItemData[];
  groupRef: React.RefObject<Group | null>;
  onLayout?: () => void;
}

function PackItemMesh({
  item,
  layoutFactor,
}: {
  item: PackItemData;
  layoutFactor: number;
}) {
  const contentRef = useRef<Group>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    fitPackItemToBox(content, layoutFactor);
  }, [item.slug, item.packStyle, layoutFactor]);

  return (
    <group ref={contentRef}>
      <ProductShape3D
        slug={item.slug}
        image={item.image}
        category={item.category}
        size="pack"
        exploded={item.packStyle === "disassembled"}
      />
    </group>
  );
}

export function PackItems({ items, groupRef, onLayout }: PackItemsProps) {
  const slice = items.slice(0, MAX_PACK_VISUAL_ITEMS);
  const layoutFactor =
    slice.length >= 4 ? 0.48 : slice.length === 3 ? 0.52 : slice.length > 1 ? 0.58 : 1;

  useLayoutEffect(() => {
    onLayout?.();
  }, [slice, layoutFactor, onLayout]);

  return (
    <group ref={groupRef}>
      {slice.map((item, i) => {
        const [x, , z] =
          slice.length === 1 ? [0, 0, 0] : (ITEM_OFFSETS[i] ?? [0, 0, 0]);
        return (
          <group key={`${item.slug}-${i}`} position={[x, 0, z]}>
            <PackItemMesh item={item} layoutFactor={layoutFactor} />
          </group>
        );
      })}
    </group>
  );
}
