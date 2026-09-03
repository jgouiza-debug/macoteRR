/// <reference lib="webworker" />

import { CacheFirst, NetworkFirst, StaleWhileRevalidate, ExpirationPlugin, CacheableResponsePlugin } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Injected from next.config.ts (git sha / deploy id), so every deploy gets fresh runtime
// caches instead of serving a previous build's assets. Falls back to "dev" locally.
const CACHE_VERSION = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  fallbacks: {
    // Served for a navigation when both the network and the page cache miss (offline on a
    // page never visited). /~offline is public (src/proxy.ts) and precached via next.config.ts.
    entries: [{ url: "/~offline", matcher: ({ request }) => request.destination === "document" }],
  },
  runtimeCaching: [
    // 0a. Google Fonts stylesheet: revalidate in the background, serve fast.
    {
      matcher: ({ url }) => url.hostname === "fonts.googleapis.com",
      handler: new StaleWhileRevalidate({
        cacheName: `macote-google-fonts-css-${CACHE_VERSION}`,
        plugins: [new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 7 * 24 * 60 * 60 })],
      }),
    },
    // 0b. Google Fonts files: they never change under a URL, so cache-first for a year.
    {
      matcher: ({ url }) => url.hostname === "fonts.gstatic.com",
      handler: new CacheFirst({
        cacheName: `macote-google-fonts-files-${CACHE_VERSION}`,
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }),
        ],
      }),
    },
    // 0c. Next.js optimised images: revalidate in the background.
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/image"),
      handler: new StaleWhileRevalidate({
        cacheName: `macote-images-${CACHE_VERSION}`,
        plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
      }),
    },
    // 1. Static Assets & App Shell: Cache-First with versioned invalidation
    {
      matcher: ({ url }) =>
        url.pathname.startsWith("/_next/static/") ||
        url.pathname.startsWith("/icons/") ||
        url.pathname.endsWith(".svg") ||
        url.pathname.endsWith(".woff2"),
      handler: new CacheFirst({
        cacheName: `macote-static-${CACHE_VERSION}`,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // 2. Reference Data: Stale-While-Revalidate
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/reference/"),
      handler: new StaleWhileRevalidate({
        cacheName: `macote-reference-${CACHE_VERSION}`,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 20,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          }),
        ],
      }),
    },
    // 3. User Data / General API: Network-First with Cache Fallback
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: `macote-api-${CACHE_VERSION}`,
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          }),
        ],
      }),
    },
    // 4. HTML Page Navigations: Network-First with App Shell Cache Fallback
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: `macote-pages-${CACHE_VERSION}`,
        networkTimeoutSeconds: 2,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 30,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();

/**
 * Web Push. A push carries { title, body, url, tag }; the notification, when tapped, focuses an
 * open MaCote tab and navigates it (or opens one). The URL is resolved against this origin and
 * anything else falls back to /dashboard, so a malformed payload can never open an off-site tab.
 * Nothing sends these until VAPID keys and the send-due cron are configured (docs/SETUP-CLOUD.md).
 */
self.addEventListener("push", (event) => {
  let data: { title?: string; body?: string; url?: string; tag?: string } = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = {};
  }
  const title = data.title || "MaCote";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icons/icon-192.png",
      data: { url: data.url || "/dashboard" },
      tag: data.tag,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = (event.notification.data as { url?: string } | undefined)?.url ?? "/dashboard";
  let target = "/dashboard";
  try {
    const resolved = new URL(raw, self.location.origin);
    if (resolved.origin === self.location.origin) target = resolved.pathname + resolved.search;
  } catch {
    /* keep the default */
  }
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.focus();
          await client.navigate(target);
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
