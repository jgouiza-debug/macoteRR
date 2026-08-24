/**
 * Bundle analysis benchmark: Reads client build artifacts in .next/static/
 * to calculate transferred JS (gzipped/brotli), uncompressed/parsed JS,
 * and the top modules by size per route.
 */

import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

export type RouteBundleStat = {
  route: string;
  transferredBytes: number;
  parsedBytes: number;
  topChunks: { name: string; sizeBytes: number; gzipBytes: number }[];
};

export type BundleReport = {
  totalTransferredBytes: number;
  totalParsedBytes: number;
  routes: RouteBundleStat[];
  topModulesOverall: { name: string; sizeBytes: number; gzipBytes: number }[];
};

const NEXT_STATIC_DIR = join(process.cwd(), ".next/static");
const CHUNKS_DIR = join(NEXT_STATIC_DIR, "chunks");

const TARGET_ROUTES = [
  { name: "/", pattern: "app/page" },
  { name: "/dashboard", pattern: "app/dashboard" },
  { name: "/programs", pattern: "app/programs" },
  { name: "/bursaries", pattern: "app/bursaries" },
  { name: "/profile", pattern: "app/profile" },
];

export function analyzeBundles(): BundleReport {
  if (!existsSync(CHUNKS_DIR)) {
    return {
      totalTransferredBytes: 0,
      totalParsedBytes: 0,
      routes: [],
      topModulesOverall: [],
    };
  }

  const allChunks: { name: string; sizeBytes: number; gzipBytes: number }[] = [];

  function scanDir(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".js")) {
        const content = readFileSync(fullPath);
        const sizeBytes = statSync(fullPath).size;
        const gzipBytes = gzipSync(content).byteLength;
        const relativeName = fullPath.replace(NEXT_STATIC_DIR, "").replace(/^[\\/]/, "");
        allChunks.push({ name: relativeName, sizeBytes, gzipBytes });
      }
    }
  }

  scanDir(CHUNKS_DIR);

  allChunks.sort((a, b) => b.sizeBytes - a.sizeBytes);

  const sharedChunks = allChunks.filter(
    (c) => c.name.includes("framework") || c.name.includes("main") || c.name.includes("webpack"),
  );

  const sharedGzip = sharedChunks.reduce((sum, c) => sum + c.gzipBytes, 0);
  const sharedParsed = sharedChunks.reduce((sum, c) => sum + c.sizeBytes, 0);

  const routes: RouteBundleStat[] = TARGET_ROUTES.map((target) => {
    const routeChunks = allChunks.filter((c) =>
      c.name.toLowerCase().includes(target.pattern.toLowerCase()),
    );
    const routeGzip = routeChunks.reduce((sum, c) => sum + c.gzipBytes, 0) + sharedGzip;
    const routeParsed = routeChunks.reduce((sum, c) => sum + c.sizeBytes, 0) + sharedParsed;

    return {
      route: target.name,
      transferredBytes: routeGzip,
      parsedBytes: routeParsed,
      topChunks: [...routeChunks, ...sharedChunks].slice(0, 10),
    };
  });

  const totalParsed = allChunks.reduce((sum, c) => sum + c.sizeBytes, 0);
  const totalTransferred = allChunks.reduce((sum, c) => sum + c.gzipBytes, 0);

  return {
    totalTransferredBytes: totalTransferred,
    totalParsedBytes: totalParsed,
    routes,
    topModulesOverall: allChunks.slice(0, 10),
  };
}
