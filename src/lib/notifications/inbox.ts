"use client";

import { useSyncExternalStore } from "react";
import { createClient } from "@/lib/db/client";
import type { Json } from "@/lib/db/database.types";
import { readProfile } from "@/lib/profile/store";
import {
  getReferenceCatalog,
  getPreviousReferenceCatalog,
} from "@/lib/data/reference-store";
import { deriveNotificationEvents, type DerivedNotification } from "./derive";

/**
 * The notification inbox: derived from the profile, the catalogue and the four toggles, kept
 * in an external store the bell and the sheet read. Nothing here ever throws to the UI — a
 * server hiccup leaves the locally-derived list in place. Guest students get an in-memory /
 * localStorage inbox keyed on the id "guest"; signed-in students also mirror to
 * notification_events so a read on one device is a read on another.
 *
 * GUARDRAIL #5: the copy comes only from formatNotificationCopy over catalogue data; nothing
 * here ranks, recommends, or implies a chance.
 */
export type InboxItem = DerivedNotification & { readAt: string | null };
export type InboxState = { items: InboxItem[]; unread: number };

const EMPTY: InboxState = { items: [], unread: 0 };
const SEEN_KEY = "macote.bursaries.seen";
const READ_KEY = "macote.inbox";
const PRUNE_AFTER_MS = 90 * 24 * 60 * 60 * 1000;

let state: InboxState = EMPTY;
let generation = 0;
const listeners = new Set<() => void>();

function publish(next: InboxState) {
  state = next;
  for (const l of listeners) l();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function getInbox(): InboxState {
  return state;
}
export function useInbox(): InboxState {
  return useSyncExternalStore(subscribe, getInbox, () => EMPTY);
}

/* -------- localStorage helpers (all guarded) -------- */

export function readSeenBursaryIds(): string[] {
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Records matched-tier bursary ids as seen; refreshes the inbox when the set grows. */
export function markBursariesSeen(ids: string[]): void {
  if (typeof window === "undefined" || ids.length === 0) return;
  const current = new Set(readSeenBursaryIds());
  const before = current.size;
  for (const id of ids) current.add(id);
  if (current.size === before) return;
  try {
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...current]));
  } catch {
    /* storage blocked: the seen set is a convenience */
  }
  refreshInbox().catch(() => {});
}

function readReadState(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}
function writeReadState(map: Record<string, string>): void {
  try {
    window.localStorage.setItem(READ_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

async function currentUser(): Promise<{ supabase: ReturnType<typeof createClient>; userId: string } | null> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session ? { supabase, userId: session.user.id } : null;
  } catch {
    return null;
  }
}

/* -------- derive + reconcile -------- */

export async function refreshInbox(now: Date = new Date()): Promise<void> {
  if (typeof window === "undefined") return;
  const gen = ++generation;

  const profile = readProfile();
  const catalog = getReferenceCatalog();
  const previousCatalog = await getPreviousReferenceCatalog();
  const seenBursaryIds = readSeenBursaryIds();
  const user = await currentUser();
  const userId = user?.userId ?? "guest";

  const events = deriveNotificationEvents({
    userId,
    profile,
    catalog,
    prefs: profile.notificationPrefs,
    seenBursaryIds,
    previousCatalog,
    now,
  });

  const readMap = readReadState();

  if (user && events.length > 0) {
    try {
      const rows = events.map((e) => ({
        user_id: user.userId,
        category: e.category,
        subject_type: e.subjectType,
        // subject_id is a uuid column: only write the id when it is not carried as a slug.
        subject_id: e.subjectSlug === null ? e.subjectId : null,
        subject_slug: e.subjectSlug,
        payload: e.payload as unknown as Json,
        scheduled_for: e.scheduledFor,
        dedupe_key: e.dedupeKey,
      }));
      await user.supabase
        .from("notification_events")
        .upsert(rows, { onConflict: "user_id,dedupe_key", ignoreDuplicates: true });

      const keys = events.map((e) => e.dedupeKey);
      const { data } = await user.supabase
        .from("notification_events")
        .select("dedupe_key, read_at")
        .eq("user_id", user.userId)
        .in("dedupe_key", keys);
      for (const row of data ?? []) {
        if (row.read_at && !readMap[row.dedupe_key]) readMap[row.dedupe_key] = row.read_at;
      }
      // Push locally-known read marks the server has not recorded yet.
      const pending = keys.filter((k) => readMap[k] && !(data ?? []).some((r) => r.dedupe_key === k && r.read_at));
      if (pending.length > 0) {
        await user.supabase
          .from("notification_events")
          .update({ read_at: now.toISOString() })
          .eq("user_id", user.userId)
          .in("dedupe_key", pending)
          .is("read_at", null);
      }
    } catch (error) {
      console.warn("inbox: server sync failed, keeping local state", error);
    }
  }

  // Prune read marks for events no longer derived and older than 90 days.
  const derivedKeys = new Set(events.map((e) => e.dedupeKey));
  for (const [key, readAt] of Object.entries(readMap)) {
    if (!derivedKeys.has(key) && Date.parse(readAt) < now.getTime() - PRUNE_AFTER_MS) {
      delete readMap[key];
    }
  }
  writeReadState(readMap);

  const items: InboxItem[] = events
    .map((e) => ({ ...e, readAt: readMap[e.dedupeKey] ?? null }))
    .sort((a, b) =>
      a.scheduledFor === b.scheduledFor
        ? a.dedupeKey < b.dedupeKey
          ? 1
          : -1
        : a.scheduledFor < b.scheduledFor
          ? 1
          : -1,
    );
  const unread = items.filter((i) => i.readAt === null).length;

  if (gen === generation) publish({ items, unread });
}

/** Marks one item read: locally at once (the badge drops), then the server best-effort. */
export async function markRead(dedupeKey: string): Promise<void> {
  if (typeof window === "undefined") return;
  const readAt = new Date().toISOString();
  const map = readReadState();
  if (!map[dedupeKey]) {
    map[dedupeKey] = readAt;
    writeReadState(map);
  }
  const items = state.items.map((i) => (i.dedupeKey === dedupeKey ? { ...i, readAt: i.readAt ?? readAt } : i));
  publish({ items, unread: items.filter((i) => i.readAt === null).length });

  const user = await currentUser();
  if (!user) return;
  try {
    await user.supabase
      .from("notification_events")
      .update({ read_at: readAt })
      .eq("user_id", user.userId)
      .eq("dedupe_key", dedupeKey);
  } catch (error) {
    console.warn("inbox: could not mark read on the server", error);
  }
}
