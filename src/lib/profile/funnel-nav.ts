"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safePath } from "@/lib/safe-path";

/**
 * The two query parameters that carry intent through the onboarding funnel.
 *
 *   ?edit=1   "I came from inside the app to change one thing." The guard lets a signed-in
 *             student onto the step, and finishing the step returns to `next` instead of
 *             marching on to the following step. Without it, "Modifier" on the profile led
 *             into a funnel whose guard bounced every signed-in student straight back to the
 *             dashboard — and wiped their DEC on the way.
 *
 *   ?next=/x  Where to land when the step (edit mode) or the whole funnel (account, callback)
 *             completes. src/proxy.ts sets it when it bounces a signed-out deep link; it used
 *             to be dropped by the funnel's first hop, so every deep link ended on /dashboard.
 *
 * `next` is attacker-influencable (it survives into an email link), so only same-origin,
 * path-relative destinations are honoured — the same rule as src/app/auth/callback/route.ts.
 */
export type FunnelParams = {
  edit: boolean;
  next: string | null;
};

export const DEFAULT_EDIT_RETURN = "/profile";
export const DEFAULT_FUNNEL_RETURN = "/dashboard";

export { safePath };

export function parseFunnelParams(search: string | URLSearchParams): FunnelParams {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  return { edit: params.get("edit") === "1", next: safePath(params.get("next")) };
}

/** For code that runs outside a render (the guard's effect, the funnel entry router). */
export function readFunnelParams(): FunnelParams {
  if (typeof window === "undefined") return { edit: false, next: null };
  return parseFunnelParams(window.location.search);
}

/** `href` with the intent parameters carried along. Existing query strings are preserved. */
export function withFunnelParams(href: string, params: Partial<FunnelParams>): string {
  const [pathAndQuery, hash] = href.split("#");
  const [path, query = ""] = pathAndQuery.split("?");
  const search = new URLSearchParams(query);
  if (params.edit) search.set("edit", "1");
  else search.delete("edit");
  const next = safePath(params.next);
  if (next) search.set("next", next);
  else search.delete("next");
  const qs = search.toString();
  return `${path}${qs ? `?${qs}` : ""}${hash ? `#${hash}` : ""}`;
}

/**
 * Funnel navigation for a client screen. Reads intent from the URL and hands back the two
 * things a step needs: an `hrefFor` that keeps intent on any link it renders, and a
 * `finishStep` that knows whether "done" means "next step" or "back where I came from".
 *
 * Uses `useSearchParams`, so the nearest layout must provide a Suspense boundary
 * (src/app/onboarding/layout.tsx does) or production prerendering of the step fails.
 */
export function useFunnelNav() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useMemo(() => parseFunnelParams(searchParams), [searchParams]);

  const hrefFor = useCallback((href: string) => withFunnelParams(href, params), [params]);

  const goTo = useCallback((href: string) => router.push(withFunnelParams(href, params)), [router, params]);

  /**
   * Edit mode: replace (not push) to the return path, so back does not re-enter the step.
   * Funnel mode: push the next step with intent intact.
   */
  const finishStep = useCallback(
    (nextStepHref: string) => {
      if (params.edit) router.replace(params.next ?? DEFAULT_EDIT_RETURN);
      else router.push(withFunnelParams(nextStepHref, params));
    },
    [router, params],
  );

  /** Where the funnel as a whole should land once the account exists. */
  const funnelReturn = params.next ?? DEFAULT_FUNNEL_RETURN;

  return { ...params, hrefFor, goTo, finishStep, funnelReturn };
}
