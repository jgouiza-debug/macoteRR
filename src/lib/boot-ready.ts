"use client";

import { useSyncExternalStore } from "react";

/**
 * "The first real screen is on the page." A one-way flag the shells raise once they render
 * content rather than a skeleton; the boot splash fades on it (after its floor) instead of on
 * a fixed timer, so a fast phone is not held behind a logo and a slow network is covered.
 */
let ready = false;
const listeners = new Set<() => void>();

export function signalAppReady() {
  if (ready) return;
  ready = true;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAppReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => ready,
    () => false,
  );
}
