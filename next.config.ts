import path from "node:path";
import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

/**
 * A stable id for this build, used as the service worker's runtime cache version so every
 * deploy serves fresh caches. Prefers the platform's commit sha, falls back to the local git
 * sha, then "dev". Exposed to sw.ts (and any client) as NEXT_PUBLIC_BUILD_ID.
 */
function resolveBuildId(): string {
  const fromEnv = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA;
  if (fromEnv) return fromEnv.slice(0, 12);
  try {
    return execSync("git rev-parse --short=12 HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim() || "dev";
  } catch {
    return "dev";
  }
}

const BUILD_ID = resolveBuildId();

const nextConfig: NextConfig = {
  // Pins the workspace root to this repo — otherwise Next.js walks up looking for
  // lockfiles and picks up an unrelated one at C:\Users\Rever\package-lock.json.
  outputFileTracingRoot: path.join(__dirname),
  env: { NEXT_PUBLIC_BUILD_ID: BUILD_ID },
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Append the offline fallback page to the precache manifest; everything else in it is exactly
  // what serwist built (client assets + public/**). The built-in URL-rewrite transform leaves
  // /~offline untouched.
  manifestTransforms: [
    async (entries) => ({
      manifest: [...entries, { url: "/~offline", revision: BUILD_ID, size: 0 }],
      warnings: [],
    }),
  ],
});

export default withSerwist(nextConfig);
