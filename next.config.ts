import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function nextConfig(phase: string): NextConfig {
  let distDir = ".next";

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    distDir = ".next-dev";
  }

  return {
    reactStrictMode: true,
    outputFileTracingRoot: process.cwd(),
    // Never let `next dev` and `next build` mutate the same manifests/chunks.
    distDir,
  };
}
