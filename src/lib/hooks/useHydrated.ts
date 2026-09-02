"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * false on the server pass and on the hydration render, true from the very next render.
 *
 * The profile store is `useSyncExternalStore`-backed, so its first client render must match
 * the server snapshot (an empty profile) before it corrects to the real localStorage value.
 * Any redirect or layout decision taken on that transient snapshot fires against a profile
 * the student does not have. Gate on this instead, and keep every hook ABOVE the early
 * return it guards: a hook placed after the guard is skipped on the hydration pass and then
 * called on the next one, which is the "Rendered more hooks than during the previous render"
 * crash that took the dashboard down for every student who had finished onboarding.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
