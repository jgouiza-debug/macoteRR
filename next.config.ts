import path from "node:path";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  // Pins the workspace root to this repo — otherwise Next.js walks up looking for
  // lockfiles and picks up an unrelated one at C:\Users\Rever\package-lock.json.
  outputFileTracingRoot: path.join(__dirname),
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
