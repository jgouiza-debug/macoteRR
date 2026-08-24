"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { SelfTagId } from "@/lib/tags/taxonomy";

/**
 * Local-first student profile. Everything the product knows about a student lives here and
 * is computed locally — per the latency budget, profile edits, bursary matching and program
 * filtering must never round-trip to the network.
 *
 * GUARDRAIL #3: this shape must never grow an income, household, or financial-need field.
 */
export type StudentProfile = {
  cegepId: string | null;
  cegepProgramId: string | null;
  currentSession: number | null;
  rScore: number | null;
  rScoreStatus: "confirmed" | "estimated" | null;
  selfTags: SelfTagId[];
  targetUniversityProgramIds: string[];
};

const STORAGE_KEY = "macote.profile";

export const DEFAULT_PROFILE: StudentProfile = {
  cegepId: "sainte-foy",
  cegepProgramId: "sciences-nature",
  currentSession: 5,
  rScore: 32.4,
  rScoreStatus: "estimated",
  selfTags: ["volunteering"],
  targetUniversityProgramIds: ["hec-baa"],
};

const listeners = new Set<() => void>();

// Cached so getSnapshot returns a referentially stable object between writes —
// useSyncExternalStore compares with Object.is and would loop on a fresh object each call.
let cache: StudentProfile | null = null;

function emit() {
  cache = null;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function read(): StudentProfile {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<StudentProfile>) } : DEFAULT_PROFILE;
  } catch {
    cache = DEFAULT_PROFILE;
  }
  return cache;
}

function readServer(): StudentProfile {
  return DEFAULT_PROFILE;
}

function write(next: StudentProfile) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked — the session still works, it just will not persist */
  }
  emit();
}

export function useStudentProfile() {
  const profile = useSyncExternalStore(subscribe, read, readServer);

  // Optimistic by construction: local state updates and renders before anything else.
  const update = useCallback((patch: Partial<StudentProfile>) => {
    write({ ...read(), ...patch });
  }, []);

  const toggleTag = useCallback((tagId: SelfTagId) => {
    const current = read();
    const selfTags = current.selfTags.includes(tagId)
      ? current.selfTags.filter((t) => t !== tagId)
      : [...current.selfTags, tagId];
    write({ ...current, selfTags });
  }, []);

  return { profile, update, toggleTag };
}
