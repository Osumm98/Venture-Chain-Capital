"use client";

import dynamic from "next/dynamic";

/**
 * Client-side wrapper for the Hero3D component.
 * Three.js requires browser APIs (WebGL, DOM), so we must:
 * 1. Mark this as a Client Component ("use client")
 * 2. Use dynamic import with ssr: false
 */
const Hero3DCanvas = dynamic(
  () =>
    import("@/components/hero-3d").then((mod) => ({
      default: mod.Hero3D,
    })),
  { ssr: false }
);

export function Hero3DWrapper(): React.JSX.Element {
  return <Hero3DCanvas />;
}
