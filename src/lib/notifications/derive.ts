/**
 * Pure derivation of what a student should be told: the profile, the catalogue and the four
 * toggles in; a sorted, de-duplicated list of notification events out. No I/O, no clock of its
 * own — `now` is the only source of time, so a nightly job, the inbox and this file's check
 * script (scripts/checks/notifications.check.ts) all agree on which day it is.
 *
 * What the later groups do with the result is not this file's business: the inbox renders
 * events through formatNotificationCopy (src/lib/notifications/service.ts), the upsert writes
 * them into notification_events keyed on `dedupeKey`, web push follows `deepLink`.
 *
 * Never emitted, on purpose:
 *   - grade_window: SESSIONS (src/lib/sample-data.ts) carry labels only, no grade-release
 *     dates. A reminder timed on an invented date is a fabricated figure — guardrail #1.
 *   - counselor_season: no catalogue table records when guidance appointment windows open.
 *     Same rule: nothing may be faked so the app has something to say.
 *
 * GUARDRAIL #1: every payload that carries a figure or a date also carries the `sourceUrl`
 * and `lastVerifiedAt` of the catalogue row it came from.
 * GUARDRAIL #5: payloads state dates and ranges. Nothing here ranks, recommends, or implies
 * a chance — the only strings in a payload are catalogue names and titles.
 */
import { getDeadlinesForStudent } from "@/lib/data/important-dates";
import type { ReferenceCatalog } from "@/lib/data/reference-catalog";
import { daysUntil, todayIso } from "@/lib/dates";
import { matchBursaries, type StudentContext } from "@/lib/matching/match";
import type { StudentProfile } from "@/lib/profile/store";
import { getCutoffRange, type CutoffRange } from "@/lib/rscore/cutoff-range";
import { buildNotificationDedupeKey, getNotificationDeepLink } from "./service";
import type {
  NotificationCategory,
  NotificationPayload,
  NotificationPreferences,
  NotificationSubjectType,
} from "./types";

export type DerivedNotification = {
  category: NotificationCategory;
  subjectType: NotificationSubjectType;
  /** The catalogue id of the deadline, bursary or university programme. */
  subjectId: string;
  /**
   * The catalogue slug for `notification_events.subject_slug`. In both the bundled and the
   * DB-built catalogue the id field already carries the catalog slug
   * (src/lib/data/reference-server.ts maps `catalog_slug ?? id`), so this equals `subjectId`
   * unless the id is a raw UUID — a DB row that never got a slug — in which case it is null.
   */
  subjectSlug: string | null;
  dedupeKey: string;
  /** ISO calendar date, YYYY-MM-DD, in the student's local time. */
  scheduledFor: string;
  deepLink: string;
  /**
   * What formatNotificationCopy (./service.ts) reads, plus the source and verification date
   * behind every figure:
   *   - deadline_reminder: `titleFr` / `titleEn`, picked by locale (`title` is the French
   *     fallback), `daysLeft`, `dateIso`;
   *   - new_bursary_match: `foundationName`, `newMatchesCount`, `daysLeft` (only while the
   *     deadline is still ahead), `amountMin` / `amountMax`, `deadlineIso`;
   *   - cutoff_update: `programName`, `oldRange` / `newRange` — the getCutoffRange shape or
   *     null, rendered as "low–high (years)" or an em dash. Never `oldCutoff` / `newCutoff`:
   *     a published range is not one figure, and a single number would conflate.
   *
   * `daysLeft` is a snapshot relative to `now` on the day of derivation, while `dedupeKey` is
   * stable across nightly runs: an inbox that shows an event later must recompute it from
   * `dateIso` / `deadlineIso` and its own clock, never read the stored value verbatim.
   *
   * Typed as NotificationPayload rather than a bare Record so the copy formatter takes it as
   * is; its index signature keeps it a `Record<string, unknown>` for the DB's `payload` column.
   */
  payload: NotificationPayload;
};

export type DeriveNotificationInput = {
  userId: string;
  profile: StudentProfile;
  catalog: ReferenceCatalog;
  prefs: NotificationPreferences;
  /** Bursary ids the student has already been told about; they never re-fire. */
  seenBursaryIds: string[];
  /** The catalogue the student last saw. Absent → no cutoff comparison is possible. */
  previousCatalog?: ReferenceCatalog | null;
  /** The only clock. */
  now: Date;
};

/** Reminders fire from this many days before a deadline up to the day itself, inclusive. */
export const DEADLINE_REMINDER_WINDOW_DAYS = 14;

/** Same fields the bursaries page hands matchBursaries, so both screens agree on the tiers. */
export function toStudentContext(profile: StudentProfile): StudentContext {
  return {
    cegepId: profile.cegepId,
    cegepProgramId: profile.cegepProgramId,
    currentSession: profile.currentSession,
    rScore: profile.rScore,
    selfTags: profile.selfTags,
    targetUniversityProgramIds: profile.targetUniversityProgramIds,
  };
}

export function deriveNotificationEvents(input: DeriveNotificationInput): DerivedNotification[] {
  const { userId, profile, catalog, prefs, now } = input;

  // Keyed on dedupeKey so no two events can share one; the first derivation wins.
  const events = new Map<string, DerivedNotification>();
  const add = (event: DerivedNotification) => {
    if (!events.has(event.dedupeKey)) events.set(event.dedupeKey, event);
  };

  // One matching pass serves both bursary-driven categories.
  const matches =
    prefs.deadlineReminders || prefs.newBursaryMatches
      ? matchBursaries(catalog.bursaries, toStudentContext(profile), now)
      : null;

  if (prefs.deadlineReminders) {
    for (const deadline of getDeadlinesForStudent(profile.targetUniversityProgramIds, catalog.deadlines)) {
      const daysLeft = daysUntil(deadline.dateIso, now);
      if (!inReminderWindow(daysLeft)) continue;
      add(
        buildEvent(userId, {
          category: "deadline_reminder",
          subjectType: "deadline",
          subjectId: deadline.id,
          qualifier: deadline.dateIso,
          scheduledFor: deadline.dateIso,
          payload: {
            title: deadline.titleFr,
            titleFr: deadline.titleFr,
            titleEn: deadline.titleEn,
            dateIso: deadline.dateIso,
            // A snapshot of `now`; see the payload doc on DerivedNotification.
            daysLeft,
            sourceUrl: deadline.sourceUrl,
            lastVerifiedAt: deadline.lastVerifiedAt,
          },
        }),
      );
    }

    // Explore-tier bursaries are the open, criteria-free baseline every student sees; only the
    // two tiers that matched something in this student's own profile are worth an interruption.
    for (const { bursary } of [...(matches?.matched ?? []), ...(matches?.close ?? [])]) {
      if (!bursary.deadlineIso) continue;
      // A month- or year-precise deadline has no honest day count: never turn its placeholder
      // day into "ferme dans 3 jours" (guardrail #1 — a figure nobody published).
      if ((bursary.deadlinePrecision ?? "day") !== "day") continue;
      const daysLeft = daysUntil(bursary.deadlineIso, now);
      if (!inReminderWindow(daysLeft)) continue;
      add(
        buildEvent(userId, {
          category: "deadline_reminder",
          subjectType: "bursary",
          subjectId: bursary.id,
          qualifier: bursary.deadlineIso,
          scheduledFor: bursary.deadlineIso,
          payload: {
            // A bursary has one name in the catalogue; both language slots carry it so the
            // inbox reads deadline payloads uniformly.
            title: bursary.name,
            titleFr: bursary.name,
            titleEn: bursary.name,
            foundationName: bursary.sourceOrg,
            dateIso: bursary.deadlineIso,
            deadlinePrecision: bursary.deadlinePrecision ?? "day",
            daysLeft,
            sourceUrl: bursary.sourceUrl,
            lastVerifiedAt: bursary.lastVerifiedAt,
          },
        }),
      );
    }
  }

  if (prefs.newBursaryMatches && matches) {
    const seen = new Set(input.seenBursaryIds);
    const today = todayIso(now);
    for (const { bursary } of matches.matched) {
      if (seen.has(bursary.id)) continue;
      const daysLeft = bursary.deadlineIso ? daysUntil(bursary.deadlineIso, now) : null;
      const precision = bursary.deadlineIso ? (bursary.deadlinePrecision ?? "day") : null;
      // Deviation from the brief, on purpose: "nouvelle bourse admissible" for a competition
      // that closed on a known day is misleading copy, so a day-precise deadline already past
      // is skipped — it fires the day the catalogue publishes a new date. A month- or
      // year-precise deadline is too coarse to call closed from `daysUntil`, so it stays.
      if (precision === "day" && daysLeft !== null && daysLeft < 0) continue;
      add(
        buildEvent(userId, {
          category: "new_bursary_match",
          subjectType: "bursary",
          subjectId: bursary.id,
          scheduledFor: today,
          payload: {
            title: bursary.name,
            foundationName: bursary.sourceOrg,
            newMatchesCount: 1,
            amountMin: bursary.amountMin,
            amountMax: bursary.amountMax,
            deadlineIso: bursary.deadlineIso,
            deadlinePrecision: precision,
            // Only a deadline still ahead is worth a "closes in N days"; a coarse past one is
            // not. A snapshot of `now`: see the payload doc on DerivedNotification.
            ...(daysLeft !== null && daysLeft >= 0 ? { daysLeft } : {}),
            sourceUrl: bursary.sourceUrl,
            lastVerifiedAt: bursary.lastVerifiedAt,
          },
        }),
      );
    }
  }

  const previous = input.previousCatalog;
  if (prefs.cutoffUpdates && previous) {
    const previousById = new Map(previous.universityPrograms.map((p) => [p.id, p]));
    const currentById = new Map(catalog.universityPrograms.map((p) => [p.id, p]));
    const today = todayIso(now);
    for (const id of profile.targetUniversityProgramIds) {
      const current = currentById.get(id);
      const before = previousById.get(id);
      // A programme absent from either side is an addition or a removal, not an update.
      if (!current || !before) continue;
      const oldRange = getCutoffRange(before.cutoffHistory);
      const newRange = getCutoffRange(current.cutoffHistory);
      if (sameRange(oldRange, newRange)) continue;
      add(
        buildEvent(userId, {
          category: "cutoff_update",
          subjectType: "university_program",
          subjectId: current.id,
          qualifier: catalog.version,
          scheduledFor: today,
          payload: {
            programName: current.name,
            institution: current.institution,
            // Ranges, never a single number: see src/lib/rscore/cutoff-range.ts. A null side
            // reads as "not yet verified" (CUTOFF_STATUS_LABEL_KEY.unknown), nothing else.
            oldRange,
            newRange,
            previousCatalogVersion: previous.version,
            catalogVersion: catalog.version,
            sourceUrl: current.sourceUrl,
            lastVerifiedAt: current.lastVerifiedAt,
          },
        }),
      );
    }
  }

  return [...events.values()].sort(byScheduleThenKey);
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

function inReminderWindow(daysLeft: number | null): daysLeft is number {
  return daysLeft !== null && daysLeft >= 0 && daysLeft <= DEADLINE_REMINDER_WINDOW_DAYS;
}

/**
 * Object.is, not ===: a NaN cutoff present identically on both sides is the same range, and
 * byte-identical catalogues must never report an update.
 */
function sameRange(a: CutoffRange | null, b: CutoffRange | null): boolean {
  if (a === null || b === null) return a === b;
  return (
    Object.is(a.low, b.low) &&
    Object.is(a.high, b.high) &&
    a.years.length === b.years.length &&
    a.years.every((year, i) => Object.is(year, b.years[i]))
  );
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The catalogue id is the catalog slug, except for a raw DB UUID, which is no slug at all. */
function catalogSlugOf(id: string): string | null {
  return UUID_RE.test(id) ? null : id;
}

function buildEvent(
  userId: string,
  params: {
    category: NotificationCategory;
    subjectType: NotificationSubjectType;
    subjectId: string;
    qualifier?: string;
    scheduledFor: string;
    payload: NotificationPayload;
  },
): DerivedNotification {
  const { category, subjectType, subjectId, qualifier, scheduledFor, payload } = params;
  const subjectSlug = catalogSlugOf(subjectId);
  return {
    category,
    subjectType,
    subjectId,
    subjectSlug,
    dedupeKey: buildNotificationDedupeKey({ category, userId, subjectId, qualifier }),
    scheduledFor,
    deepLink: getNotificationDeepLink({
      category,
      subjectType,
      subjectId,
      catalogSlug: subjectSlug ?? undefined,
    }),
    payload,
  };
}

/** Code-point order, not localeCompare: the same input must sort the same on every machine. */
function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function byScheduleThenKey(a: DerivedNotification, b: DerivedNotification): number {
  return compareStrings(a.scheduledFor, b.scheduledFor) || compareStrings(a.dedupeKey, b.dedupeKey);
}
