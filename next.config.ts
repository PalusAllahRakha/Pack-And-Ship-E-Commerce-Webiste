import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "@react-three/drei",
      "@react-three/fiber",
      "three",
      "gsap",
    ],
  },
};

export default nextConfig;
