"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";

export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useCartStore.persist.hasHydrated());
    return useCartStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
