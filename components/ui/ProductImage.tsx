"use client";

import Image from "next/image";
import { useState } from "react";
import type { Category } from "@/lib/types";
import { getProductImageFallback } from "@/lib/productImage";

interface ProductImageProps {
  src: string;
  alt: string;
  category: Category;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  category,
  className = "object-cover",
  sizes,
  priority,
}: ProductImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const fallback = getProductImageFallback(category);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => {
        if (currentSrc !== fallback) setCurrentSrc(fallback);
      }}
    />
  );
}
