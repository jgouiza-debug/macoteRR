"use client";

import { useCallback, useSyncExternalStore, useEffect } from "react";
import type { SelfTagId } from "@/lib/tags/taxonomy";
import type { InterestId } from "@/lib/tags/interests";
import { idbSet } from "@/lib/data/indexed-db";
import { createClient } from "@/lib/db/client";
import { syncProfileToServer } from "./sync";

/**
 * Local-first student profile with optimistic updates and offline mutation queue.
 *
 * Latency budget: local updates render immediately (0ms perceived).
 * Writes are queued and flushed in background with retry and rollback.
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
  interestIds: InterestId[];
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

export const DEFAULT_PROFILE: StudentProfile = {
  cegepId: null,
  cegepProgramId: null,
  currentSession: null,
  rScore: null,
  rScoreStatus: null,
  selfTags: [],
  targetUniversityProgramIds: [],
  interestIds: [],
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
    idbSet("reference_catalog", "profile_backup", next).catch(() => {});
  } catch {
    /* storage quota exceeded or blocked */
  }
  emit();
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

// Background sync worker for flushing offline mutations
async function flushOutbox() {
  if (outbox.length === 0 || typeof navigator === "undefined" || !navigator.onLine) {
    return;
  }

  const pending = outbox.filter((m) => m.status === "pending" || m.status === "failed");
  if (pending.length === 0) return;

  // Local session check, no network round-trip — guests (no account) have nothing to push
  // yet, matching "no account required" by design; only signed-in devices sync.
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  for (const mutation of pending) {
    mutation.status = "processing";
    mutation.attempts += 1;
    saveOutbox();

    try {
      if (session) {
        await syncProfileToServer(supabase, session.user.id, read());
      }
      mutation.status = "completed";
      outbox = outbox.filter((m) => m.id !== mutation.id);
      saveOutbox();
    } catch {
      mutation.status = "failed";
      saveOutbox();

      if (mutation.attempts >= 5) {
        // Rollback after 5 failed attempts and notify user
        write(mutation.previousSnapshot);
        outbox = outbox.filter((m) => m.id !== mutation.id);
        saveOutbox();
        notifyError("Impossible d'enregistrer les modifications après plusieurs tentatives. Rétablissement de l'état précédent.");
      }
    }
  }
}

if (typeof window !== "undefined") {
  loadOutbox();
  window.addEventListener("online", () => {
    flushOutbox().catch(() => {});
  });
}

/**
 * Pushes the current local profile up regardless of outbox state — covers the moment right
 * after signing in, when everything already synced as a no-op guest and there's nothing
 * queued, but a server row still needs to exist for the now-authenticated user.
 */
export async function syncNow() {
  if (typeof navigator === "undefined" || !navigator.onLine) return;
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;
  await syncProfileToServer(supabase, session.user.id, read());
}

export function useStudentProfile() {
  const profile = useSyncExternalStore(subscribe, read, readServer);

  useEffect(() => {
    // Initial sync check on mount
    flushOutbox().catch(() => {});
    syncNow().catch(() => {});
  }, []);

  // Optimistic by construction: local state updates and renders before anything else.
  const update = useCallback((patch: Partial<StudentProfile>) => {
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
  }, []);

  const toggleTag = useCallback((tagId: SelfTagId) => {
    const current = read();
    const selfTags = current.selfTags.includes(tagId)
      ? current.selfTags.filter((t) => t !== tagId)
      : [...current.selfTags, tagId];
    update({ selfTags });
  }, [update]);

  return { profile, update, toggleTag };
}
