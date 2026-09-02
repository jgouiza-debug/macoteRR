"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { SelfTagId } from "@/lib/tags/taxonomy";
import type { InterestId } from "@/lib/tags/interests";
import { idbDelete, idbSet } from "@/lib/data/indexed-db";
import { createClient } from "@/lib/db/client";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from "@/lib/notifications/types";
import { pullProfileFromServer, syncProfileToServer } from "./sync";

/**
 * Local-first student profile with optimistic updates and an offline mutation queue.
 *
 * The browser's copy is the working copy: every edit renders immediately and is queued for
 * the server. The server is the copy that survives a lost phone. Reconciling the two is
 * ordered (push what is pending, then pull, then adopt whichever is newer) so a slow pull can
 * never overwrite an edit the student just made — which is what three concurrent calls on
 * every mount used to allow.
 *
 * GUARDRAIL #3: this shape must never grow an income, household, or financial-need field.
 * GUARDRAIL #4: mutations are never fire-and-forget. They are tracked, queued, retried with
 * backoff, and when they keep failing the student is told — the local copy is NOT reverted,
 * because deleting a student's own edit to satisfy a server that is down is the worse outcome.
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
  /** The Sciences humaines / Sciences de la nature profile picked in the DEC step. */
  decProfileId: string | null;
  /** "Passer cette étape" on the goal step: no targets, on purpose. */
  goalSkipped: boolean;
  /** The four notification toggles. Lived in a third localStorage key before; now one store. */
  notificationPrefs: NotificationPreferences;
};

export type MutationRecord = {
  id: string;
  timestamp: number;
  patch: Partial<StudentProfile>;
  previousSnapshot: StudentProfile;
  attempts: number;
  status: "pending" | "processing" | "failed" | "completed";
  /** Earliest time the next attempt is allowed (exponential backoff after a failure). */
  nextAttemptAt?: number;
};

export type SyncState =
  /** Not yet checked for a session, or no window. */
  | "unknown"
  /** No session: local-only, nothing to reconcile. */
  | "guest"
  /** Signed in; first reconcile in flight. Pages should not redirect on local state yet. */
  | "syncing"
  /** Signed in; local and server agree as of the last reconcile. */
  | "synced"
  /** Signed in; the last reconcile failed. Local copy is still authoritative on this device. */
  | "error";

const STORAGE_KEY = "macote.profile";
const OUTBOX_KEY = "macote.mutation_outbox";
const META_KEY = "macote.profile_meta";
/** Pre-2026-09 location of the notification toggles; adopted once, then removed. */
const LEGACY_NOTIF_KEY = "macote.notifications";
const IDB_BACKUP_KEY = "profile_backup";

const MAX_ATTEMPTS_BEFORE_NOTIFY = 5;
const MAX_OUTBOX_RECORDS = 50;
const BACKOFF_BASE_MS = 2_000;
const BACKOFF_MAX_MS = 5 * 60_000;

export const DEFAULT_PROFILE: StudentProfile = {
  cegepId: null,
  cegepProgramId: null,
  currentSession: null,
  rScore: null,
  rScoreStatus: null,
  selfTags: [],
  targetUniversityProgramIds: [],
  interestIds: [],
  decProfileId: null,
  goalSkipped: false,
  notificationPrefs: DEFAULT_NOTIFICATION_PREFERENCES,
};

type ProfileMeta = {
  /** `student_profiles.updated_at` at the last successful pull, for last-write-wins. */
  lastPulledAt: string | null;
};

const listeners = new Set<() => void>();
const errorListeners = new Set<(key: TranslationKey) => void>();
const syncListeners = new Set<() => void>();

let cache: StudentProfile | null = null;
let outbox: MutationRecord[] = [];
let syncState: SyncState = "unknown";
let reconcilePromise: Promise<void> | null = null;

/* ------------------------------------------------------------------ *
 * Subscriptions
 * ------------------------------------------------------------------ */

function emit() {
  cache = null;
  for (const listener of listeners) listener();
}

function setSyncState(next: SyncState) {
  if (syncState === next) return;
  syncState = next;
  for (const listener of syncListeners) listener();
}

function notifyError(key: TranslationKey) {
  for (const listener of errorListeners) listener(key);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function subscribeSync(listener: () => void) {
  syncListeners.add(listener);
  return () => {
    syncListeners.delete(listener);
  };
}

/** Fires with a dictionary key when queued edits keep failing to reach the server. */
export function subscribeProfileError(listener: (key: TranslationKey) => void) {
  errorListeners.add(listener);
  return () => {
    errorListeners.delete(listener);
  };
}

/* ------------------------------------------------------------------ *
 * Local storage
 * ------------------------------------------------------------------ */

function migrateLegacyNotificationPrefs(profile: StudentProfile): StudentProfile {
  try {
    const raw = window.localStorage.getItem(LEGACY_NOTIF_KEY);
    if (!raw) return profile;
    const legacy = JSON.parse(raw) as Partial<NotificationPreferences>;
    window.localStorage.removeItem(LEGACY_NOTIF_KEY);
    const merged = { ...profile, notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFERENCES, ...legacy } };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return profile;
  }
}

function read(): StudentProfile {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cache = DEFAULT_PROFILE;
    } else {
      // Spread-merge is the migration: a profile written by an older build lacks the newer
      // fields and takes their defaults; unknown fields from a newer build are carried along.
      const parsed = JSON.parse(raw) as Partial<StudentProfile>;
      const merged: StudentProfile = {
        ...DEFAULT_PROFILE,
        ...parsed,
        notificationPrefs: { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(parsed.notificationPrefs ?? {}) },
      };
      cache = parsed.notificationPrefs ? merged : migrateLegacyNotificationPrefs(merged);
    }
  } catch {
    cache = DEFAULT_PROFILE;
  }
  return cache;
}

/**
 * The profile outside React, for code that runs before or without a render — the onboarding
 * guards and the funnel's entry router. Returns DEFAULT_PROFILE on the server, where there is
 * no localStorage to read.
 */
export function readProfile(): StudentProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  return read();
}

function readServer(): StudentProfile {
  return DEFAULT_PROFILE;
}

function write(next: StudentProfile) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    idbSet("reference_catalog", IDB_BACKUP_KEY, next).catch(() => {});
  } catch {
    /* storage quota exceeded or blocked */
  }
  emit();
}

function readMeta(): ProfileMeta {
  try {
    const raw = window.localStorage.getItem(META_KEY);
    return raw ? { lastPulledAt: null, ...(JSON.parse(raw) as Partial<ProfileMeta>) } : { lastPulledAt: null };
  } catch {
    return { lastPulledAt: null };
  }
}

function writeMeta(meta: ProfileMeta) {
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    /* ignore */
  }
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
  // A record left "processing" by a tab that closed mid-flight is pending again.
  for (const record of outbox) if (record.status === "processing") record.status = "pending";
}

function pendingRecords(): MutationRecord[] {
  return outbox.filter((m) => m.status === "pending" || m.status === "failed");
}

function mergePatches(records: MutationRecord[]): Partial<StudentProfile> {
  return records.reduce<Partial<StudentProfile>>((acc, record) => ({ ...acc, ...record.patch }), {});
}

/* ------------------------------------------------------------------ *
 * Server session helpers
 * ------------------------------------------------------------------ */

type Supabase = ReturnType<typeof createClient>;

async function currentSession(supabase: Supabase) {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}

function online(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}

/* ------------------------------------------------------------------ *
 * Outbox
 * ------------------------------------------------------------------ */

/**
 * Pushes every pending edit as one merged write. Guests (no session) keep their records
 * pending: they are what a later sign-in has to carry over, so dropping them "completed" —
 * the previous behaviour — silently lost the whole funnel for anyone who created their
 * account on the last screen.
 *
 * Failures back off exponentially and, after MAX_ATTEMPTS_BEFORE_NOTIFY, tell the student
 * once. The local copy is never reverted: it is their data, and the server being unreachable
 * is not a reason to delete it. Records stay queued and retry on the next mount or reconnect.
 */
async function flushOutbox(supabase?: Supabase, sessionUserId?: string): Promise<boolean> {
  if (!online()) return false;
  const now = Date.now();
  const due = pendingRecords().filter((m) => !m.nextAttemptAt || m.nextAttemptAt <= now);
  if (due.length === 0) return pendingRecords().length === 0;

  const client = supabase ?? createClient();
  const userId = sessionUserId ?? (await currentSession(client))?.user.id;
  if (!userId) return false; // guest: keep everything pending

  for (const record of due) {
    record.status = "processing";
    record.attempts += 1;
  }
  saveOutbox();

  try {
    await syncProfileToServer(client, userId, read(), mergePatches(due));
    const flushed = new Set(due.map((m) => m.id));
    outbox = outbox.filter((m) => !flushed.has(m.id));
    saveOutbox();
    return pendingRecords().length === 0;
  } catch {
    const worst = Math.max(...due.map((m) => m.attempts));
    const delay = Math.min(BACKOFF_BASE_MS * 2 ** (worst - 1), BACKOFF_MAX_MS);
    for (const record of due) {
      record.status = "failed";
      record.nextAttemptAt = Date.now() + delay;
    }
    saveOutbox();
    if (worst === MAX_ATTEMPTS_BEFORE_NOTIFY) notifyError("sync.unsaved");
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Reconcile: push, pull, adopt
 * ------------------------------------------------------------------ */

function profilesEqual(a: StudentProfile, b: StudentProfile): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

async function reconcile(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!online()) {
    if (syncState === "unknown") setSyncState("guest");
    return;
  }

  let supabase: Supabase;
  try {
    supabase = createClient();
  } catch {
    setSyncState("guest");
    return;
  }
  const session = await currentSession(supabase);
  if (!session) {
    setSyncState("guest");
    return;
  }

  setSyncState("syncing");
  try {
    // 1. Push: anything the student did on this device goes up first, so the pull below
    //    cannot undo it.
    const hadPending = pendingRecords().length > 0;
    if (hadPending) await flushOutbox(supabase, session.user.id);
    const stillPending = pendingRecords().length > 0;

    // 2. Pull.
    const server = await pullProfileFromServer(supabase, session.user.id, read());
    const now = new Date().toISOString();

    if (!server) {
      // First sign-in: the server row is created from the funnel the student just finished.
      await syncProfileToServer(supabase, session.user.id, read());
      writeMeta({ lastPulledAt: now });
      setSyncState("synced");
      return;
    }

    // 3. Adopt the server copy only when this device has nothing queued and the server has
    //    moved since it last looked. Otherwise the local copy wins and is pushed if it differs.
    const meta = readMeta();
    const serverIsNewer =
      meta.lastPulledAt === null || (server.updatedAt !== null && server.updatedAt > meta.lastPulledAt);
    if (!stillPending && serverIsNewer) {
      if (!profilesEqual(read(), server.profile)) write(server.profile);
    } else if (!stillPending && !profilesEqual(read(), server.profile)) {
      await syncProfileToServer(supabase, session.user.id, read());
    }
    writeMeta({ lastPulledAt: server.updatedAt ?? now });
    setSyncState(stillPending ? "error" : "synced");
  } catch {
    setSyncState("error");
  }
}

/** One reconcile at a time; concurrent callers share it. */
export function ensureReconciled(): Promise<void> {
  reconcilePromise ??= reconcile().finally(() => {
    reconcilePromise = null;
  });
  return reconcilePromise;
}

if (typeof window !== "undefined") {
  loadOutbox();
  window.addEventListener("online", () => {
    ensureReconciled().catch(() => {});
  });
  // The guest outbox drains the moment the account exists, not on the next page load.
  try {
    createClient().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") ensureReconciled().catch(() => {});
      if (event === "SIGNED_OUT") setSyncState("guest");
    });
  } catch {
    /* env missing in this build: local-only */
  }
}

/* ------------------------------------------------------------------ *
 * Public API
 * ------------------------------------------------------------------ */

/**
 * Wipes the local profile back to a fresh guest state: clears the outbox, storage, the
 * IndexedDB backup, and — critically — the in-memory `cache`, then notifies subscribers.
 * Without that last step every mounted component keeps rendering the deleted account until a
 * hard reload.
 */
export function resetProfile() {
  outbox = [];
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(OUTBOX_KEY);
    window.localStorage.removeItem(META_KEY);
    window.localStorage.removeItem(LEGACY_NOTIF_KEY);
  } catch {
    /* storage blocked — nothing local to clear */
  }
  idbDelete("reference_catalog", IDB_BACKUP_KEY).catch(() => {});
  setSyncState("guest");
  write(DEFAULT_PROFILE);
}

/** Pushes the local profile now (used right after sign-in on this device). */
export async function syncNow(): Promise<void> {
  await ensureReconciled();
}

export function getSyncState(): SyncState {
  return syncState;
}

export function useSyncState(): SyncState {
  return useSyncExternalStore(subscribeSync, getSyncState, () => "unknown" as SyncState);
}

export function useStudentProfile() {
  const profile = useSyncExternalStore(subscribe, read, readServer);
  const sync = useSyncState();

  useEffect(() => {
    ensureReconciled().catch(() => {});
  }, []);

  // Optimistic by construction: local state updates and renders before anything else.
  const update = useCallback((patch: Partial<StudentProfile>) => {
    const previous = read();
    const next = { ...previous, ...patch };

    // 1. Optimistic apply
    write(next);

    // 2. Queue for background sync, coalescing into the last still-pending record so a burst
    //    of edits is one write, not N identical ones.
    const last = outbox[outbox.length - 1];
    if (last && last.status === "pending") {
      last.patch = { ...last.patch, ...patch };
      last.timestamp = Date.now();
    } else {
      outbox.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
        patch,
        previousSnapshot: previous,
        attempts: 0,
        status: "pending",
      });
    }
    while (outbox.length > MAX_OUTBOX_RECORDS) {
      const [oldest, second, ...rest] = outbox;
      outbox = [{ ...second, patch: { ...oldest.patch, ...second.patch }, previousSnapshot: oldest.previousSnapshot }, ...rest];
    }
    saveOutbox();

    // 3. Reconcile in background
    flushOutbox().catch(() => {});
  }, []);

  const toggleTag = useCallback(
    (tagId: SelfTagId) => {
      const current = read();
      const selfTags = current.selfTags.includes(tagId)
        ? current.selfTags.filter((t) => t !== tagId)
        : [...current.selfTags, tagId];
      update({ selfTags });
    },
    [update],
  );

  return { profile, update, toggleTag, sync };
}
