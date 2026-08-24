/**
 * Shared fetch helper for HTML/PDF collectors. Per docs/02-scraping-collection-plan.md's
 * legal/ethical baseline: check robots.txt before ever fetching a page on a domain,
 * rate-limit generously, and cache with ETag/Last-Modified to skip unchanged pages (304).
 */

const USER_AGENT = "MaCoteBot/0.1 (+https://github.com/; contact via repo issues)";
const MIN_DELAY_MS = 1000;

const robotsCache = new Map<string, string[]>();
const lastRequestAtByHost = new Map<string, number>();
const rateLimitQueueByHost = new Map<string, Promise<void>>();

// In-memory / persistent HTTP cache entry
type HttpCacheEntry = {
  etag?: string;
  lastModified?: string;
  snapshot: ArrayBuffer;
};

const httpCache = new Map<string, HttpCacheEntry>();

function parseRobotsTxt(body: string): string[] {
  const groups: { agents: string[]; disallow: string[] }[] = [];
  let current: { agents: string[]; disallow: string[] } | null = null;

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (/^user-agent:/i.test(line)) {
      const agent = line.split(":")[1]?.trim().toLowerCase();
      if (!agent) continue;
      if (!current || current.disallow.length > 0) {
        current = { agents: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(agent);
    } else if (current && /^disallow:/i.test(line)) {
      const path = line.split(":")[1]?.trim();
      if (path) current.disallow.push(path);
    }
  }

  const specific = groups.find((g) => g.agents.includes("macotebot"));
  if (specific) return specific.disallow;
  const wildcard = groups.find((g) => g.agents.includes("*"));
  return wildcard?.disallow ?? [];
}

async function getDisallowedPaths(origin: string): Promise<string[]> {
  const cached = robotsCache.get(origin);
  if (cached) return cached;

  let disallowed: string[] = [];
  try {
    const res = await fetch(`${origin}/robots.txt`, { headers: { "User-Agent": USER_AGENT } });
    if (res.ok) {
      disallowed = parseRobotsTxt(await res.text());
    }
  } catch {
    // No robots.txt or unreachable: treat as "nothing disallowed"
  }

  robotsCache.set(origin, disallowed);
  return disallowed;
}

function isAllowed(pathname: string, disallowed: string[]): boolean {
  return !disallowed.some((rule) => pathname.startsWith(rule));
}

function waitForRateLimit(host: string): Promise<void> {
  const previous = rateLimitQueueByHost.get(host) ?? Promise.resolve();
  const next = previous.then(async () => {
    const last = lastRequestAtByHost.get(host) ?? 0;
    const wait = MIN_DELAY_MS - (Date.now() - last);
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    lastRequestAtByHost.set(host, Date.now());
  });
  rateLimitQueueByHost.set(host, next);
  return next;
}

export type PoliteFetchResult = {
  response: Response;
  snapshot: ArrayBuffer;
  notModified?: boolean;
};

/**
 * Fetches a URL with robots.txt check, per-host rate limiting, and conditional
 * caching via ETag / Last-Modified headers.
 */
export async function politeFetch(url: string): Promise<PoliteFetchResult> {
  const target = new URL(url);
  const disallowed = await getDisallowedPaths(target.origin);
  if (!isAllowed(target.pathname, disallowed)) {
    throw new Error(`Blocked by robots.txt: ${url}`);
  }

  await waitForRateLimit(target.host);

  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
  };

  const cachedEntry = httpCache.get(url);
  if (cachedEntry?.etag) {
    headers["If-None-Match"] = cachedEntry.etag;
  }
  if (cachedEntry?.lastModified) {
    headers["If-Modified-Since"] = cachedEntry.lastModified;
  }

  const response = await fetch(url, { headers });

  // 304 Not Modified: Reuse cached snapshot, save bandwidth
  if (response.status === 304 && cachedEntry) {
    return {
      response,
      snapshot: cachedEntry.snapshot,
      notModified: true,
    };
  }

  const snapshot = await response.clone().arrayBuffer();

  const etag = response.headers.get("etag") ?? undefined;
  const lastModified = response.headers.get("last-modified") ?? undefined;
  if (etag || lastModified) {
    httpCache.set(url, { etag, lastModified, snapshot });
  }

  return { response, snapshot, notModified: false };
}
