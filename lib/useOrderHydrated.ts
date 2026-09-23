"use client";

import { useEffect, useState } from "react";
import { useOrderStore } from "@/store/orderStore";

export function useOrderHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(useOrderStore.persist.hasHydrated());
    return useOrderStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
