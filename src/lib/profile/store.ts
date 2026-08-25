"use client";

import { useCallback, useSyncExternalStore, useEffect } from "react";
import type { SelfTagId } from "@/lib/tags/taxonomy";
import { idbSet } from "@/lib/data/indexed-db";
import { syncProfile } from "./sync";

/**
 * Local-first student profile with optimistic updates and an offline mutation queue.
 *
 * Latency budget: local updates render immediately (0ms perceived).
 * Writes are queued and flushed in the background with retry and rollback.
 *
 * Identifier vocabulary: `cegepId` is a cégep short code and `cegepProgramId` /
 * `targetUniversityProgramIds` are catalogue slugs, both from src/lib/data/catalog.ts —
 * never Supabase uuids. src/lib/profile/sync.ts is the single place those slugs become
 * database rows, so onboarding can complete before a project is even seeded.
 *
 * GUARDRAIL #3: this shape must never grow an income, household, or financial-need field.
 * GUARDRAIL #4: mutations are never fire-and-forget; tracked, queued, retried, and rolled back on permanent failure.
 */
export type StudentProfile = {
  cegepId: string | null;
  cegepProgramId: string | null;
  currentSession: number | null;
  rScore: number | null;
  rScoreStatus: "confirmed" | "estimated" | null;
  selfTags: SelfTagId[];
  targetUniversityProgramIds: string[];
  /** Set once the student finishes onboarding, so the funnel does not restart on every visit. */
  onboardingCompletedAt: string | null;
};

export type MutationRecord = {
  id: string;
  timestamp: number;
  patch: Partial<StudentProfile>;
  previousSnapshot: StudentProfile;
  attempts: number;
  status: "pending" | "processing" | "failed" | "completed";
};

const STORAGE_KEY = "macote.profile";
const OUTBOX_KEY = "macote.mutation_outbox";

/**
 * A brand-new student, not a demo one. Onboarding is mandatory now, so every field it
 * collects starts empty — prefilled sample values would let someone land on the dashboard
 * looking at a stranger's cégep.
 */
export const DEFAULT_PROFILE: StudentProfile = {
  cegepId: null,
  cegepProgramId: null,
  currentSession: null,
  rScore: null,
  rScoreStatus: null,
  selfTags: [],
  targetUniversityProgramIds: [],
  onboardingCompletedAt: null,
};

const listeners = new Set<() => void>();
const errorListeners = new Set<(message: string) => void>();

let cache: StudentProfile | null = null;
let outbox: MutationRecord[] = [];

function emit() {
  cache = null;
  for (const listener of listeners) listener();
}

function notifyError(message: string) {
  for (const listener of errorListeners) listener(message);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function subscribeProfileError(listener: (message: string) => void) {
  errorListeners.add(listener);
  return () => errorListeners.delete(listener);
}

function read(): StudentProfile {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw
      ? { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<StudentProfile>) }
      : DEFAULT_PROFILE;
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
    idbSet("reference_catalog", "profile_backup", next).catch(() => {});
  } catch {
    /* storage quota exceeded or blocked */
  }
  emit();
}

/** Read the current profile outside React — used by route guards and the onboarding funnel. */
export function readProfile(): StudentProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  return read();
}

/** Apply a patch outside React, with the same optimistic-write-then-queue semantics. */
export function patchProfile(patch: Partial<StudentProfile>) {
  if (typeof window === "undefined") return;
  enqueue(patch);
}

function saveOutbox() {
  try {
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(outbox));
  } catch {
    /* ignore */
  }
}

function loadOutbox() {
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    if (raw) outbox = JSON.parse(raw) as MutationRecord[];
  } catch {
    outbox = [];
  }
}

let flushing = false;

// Background sync worker for flushing offline mutations.
async function flushOutbox() {
  if (flushing) return;
  if (outbox.length === 0 || typeof navigator === "undefined" || !navigator.onLine) return;

  flushing = true;
  try {
    const pending = outbox.filter((m) => m.status === "pending" || m.status === "failed");

    for (const mutation of pending) {
      mutation.status = "processing";
      mutation.attempts += 1;
      saveOutbox();

      // The queue holds patches, but the server row is the whole profile, so each flush
      // sends the current merged state. Coalescing this way means a burst of onboarding
      // taps costs one write, not one per field.
      const outcome = await syncProfile(read());

      if (outcome.status === "synced") {
        outbox = outbox.filter((m) => m.id !== mutation.id);
        saveOutbox();
        continue;
      }

      if (outcome.status === "skipped") {
        // Signed out. Not a failure: park the mutation without burning an attempt so it
        // survives the whole pre-signup funnel and lands intact once a session exists.
        mutation.status = "pending";
        mutation.attempts -= 1;
        saveOutbox();
        // Nothing else in the queue can succeed either — stop rather than spin.
        break;
      }

      mutation.status = "failed";
      saveOutbox();

      if (mutation.attempts >= 5) {
        // Rollback after 5 failed attempts and notify the student.
        write(mutation.previousSnapshot);
        outbox = outbox.filter((m) => m.id !== mutation.id);
        saveOutbox();
        notifyError(
          "Impossible d'enregistrer les modifications après plusieurs tentatives. Rétablissement de l'état précédent.",
        );
      }
    }
  } finally {
    flushing = false;
  }
}

function enqueue(patch: Partial<StudentProfile>) {
  const previous = read();
  const next = { ...previous, ...patch };

  // 1. Optimistic apply
  write(next);

  // 2. Queue mutation for background sync
  const mutation: MutationRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    patch,
    previousSnapshot: previous,
    attempts: 0,
    status: "pending",
  };

  outbox.push(mutation);
  saveOutbox();

  // 3. Reconcile in background
  flushOutbox().catch(() => {});
}

/** Called after sign-in so everything queued during the anonymous funnel lands at once. */
export function flushProfileQueue() {
  return flushOutbox();
}

/** Replaces local state with the server's copy — used when signing in on a new device. */
export function hydrateProfile(remote: Partial<StudentProfile>) {
  write({ ...read(), ...remote });
}

if (typeof window !== "undefined") {
  loadOutbox();
  window.addEventListener("online", () => {
    flushOutbox().catch(() => {});
  });
}

export function useStudentProfile() {
  const profile = useSyncExternalStore(subscribe, read, readServer);

  useEffect(() => {
    // Initial sync check on mount
    flushOutbox().catch(() => {});
  }, []);

  // Optimistic by construction: local state updates and renders before anything else.
  const update = useCallback((patch: Partial<StudentProfile>) => enqueue(patch), []);

  const toggleTag = useCallback((tagId: SelfTagId) => {
    const current = read();
    const selfTags = current.selfTags.includes(tagId)
      ? current.selfTags.filter((t) => t !== tagId)
      : [...current.selfTags, tagId];
    enqueue({ selfTags });
  }, []);

  const toggleTarget = useCallback((programId: string) => {
    const current = read();
    const targetUniversityProgramIds = current.targetUniversityProgramIds.includes(programId)
      ? current.targetUniversityProgramIds.filter((id) => id !== programId)
      : [...current.targetUniversityProgramIds, programId];
    enqueue({ targetUniversityProgramIds });
  }, []);

  return { profile, update, toggleTag, toggleTarget };
}
