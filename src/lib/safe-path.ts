/**
 * A redirect target we are willing to follow: same-origin and path-relative, or nothing.
 *
 * `next` parameters travel through the proxy, the funnel, and an emailed magic link, so they
 * are attacker-influencable. `//evil.com` is a protocol-relative URL that passes a naive
 * `startsWith("/")`, hence the second check. Shared by the proxy (Node runtime), the auth
 * callback route, and the client funnel, so all three agree on what "safe" means.
 */
export function safePath(candidate: string | null | undefined): string | null {
  if (!candidate) return null;
  return candidate.startsWith("/") && !candidate.startsWith("//") ? candidate : null;
}
