/**
 * Shared fetch helper for HTML/PDF collectors. Per docs/02-scraping-collection-plan.md's
 * legal/ethical baseline: check robots.txt before ever fetching a page on a domain, and
 * rate-limit generously — there's no reason to hit a cegep's public site harder than a
 * normal visitor would.
 */

const USER_AGENT = "MaCoteBot/0.1 (+https://github.com/; contact via repo issues)";
const MIN_DELAY_MS = 1000;

const robotsCache = new Map<string, string[]>();
const lastRequestAtByHost = new Map<string, number>();
// Chains rate-limit waits per host so concurrent politeFetch calls to the same host (e.g. a
// collector fetching several pages via Promise.all) still serialize instead of all reading
// the same stale `lastRequestAtByHost` value and firing at once.
const rateLimitQueueByHost = new Map<string, Promise<void>>();

/**
 * Per robots.txt semantics, a crawler follows only the single most specific group that names
 * it -- an exact "macotebot" group, if present, entirely replaces the "*" group rather than
 * merging with it. Getting this backwards (unioning every matching group) can make a site
 * that explicitly carved out an allowance for this bot read as fully blocked.
 */
function parseRobotsTxt(body: string): string[] {
  const groups: { agents: string[]; disallow: string[] }[] = [];
  let current: { agents: string[]; disallow: string[] } | null = null;

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (/^user-agent:/i.test(line)) {
      const agent = line.split(":")[1]?.trim().toLowerCase();
      if (!agent) continue;
      // Consecutive User-agent lines belong to the same group; a Disallow line (or anything
      // else) ends the run of agent lines, so the next User-agent starts a new group.
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
    // No robots.txt or unreachable: treat as "nothing disallowed" rather than blocking collection.
  }

  robotsCache.set(origin, disallowed);
  return disallowed;
}

function isAllowed(pathname: string, disallowed: string[]): boolean {
  return !disallowed.some((rule) => pathname.startsWith(rule));
}

function waitForRateLimit(host: string): Promise<void> {
  // Queue this call after whatever's already waiting on this host, so the read of
  // `lastRequestAtByHost` below only ever happens once the previous caller has updated it.
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
};

/**
 * Fetches a URL after checking robots.txt and applying a per-host rate limit.
 * Throws if the path is disallowed — collectors must not bypass this.
 */
export async function politeFetch(url: string): Promise<PoliteFetchResult> {
  const target = new URL(url);
  const disallowed = await getDisallowedPaths(target.origin);
  if (!isAllowed(target.pathname, disallowed)) {
    throw new Error(`Blocked by robots.txt: ${url}`);
  }

  await waitForRateLimit(target.host);

  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  const snapshot = await response.clone().arrayBuffer();
  return { response, snapshot };
}
