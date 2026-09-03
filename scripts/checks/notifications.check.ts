/**
 * Minimal runnable self-check for src/lib/notifications/derive.ts. No test framework by design —
 * this repo has none. Run with:
 *
 *   npm run check:notifications   (or npx tsx scripts/checks/notifications.check.ts)
 *
 * Every "fixed" date below is computed at run time from a real row of DEFAULT_CATALOG (an
 * important date, a bursary deadline, a target programme with a published range), so a data
 * refresh moves what the checks measure, not whether they pass. The student fixture is a
 * Sainte-Foy Sciences de la nature student in session 3 with a confirmed 30: that profile lands
 * a bursary in each of the three tiers, which is what the cases need. If the catalogue changes
 * so that it no longer does, the fixture assertions below say so by name.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { DEFAULT_CATALOG, type ReferenceCatalog } from "../../src/lib/data/reference-catalog";
import { daysUntil, todayIso } from "../../src/lib/dates";
import { matchBursaries } from "../../src/lib/matching/match";
import {
  DEADLINE_REMINDER_WINDOW_DAYS,
  deriveNotificationEvents,
  toStudentContext,
  type DerivedNotification,
  type DeriveNotificationInput,
} from "../../src/lib/notifications/derive";
import { formatNotificationCopy } from "../../src/lib/notifications/service";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationCategory,
  type NotificationPreferences,
} from "../../src/lib/notifications/types";
import type { StudentProfile } from "../../src/lib/profile/store";
import { getCutoffRange } from "../../src/lib/rscore/cutoff-range";
import type { CutoffEntry } from "../../src/lib/sample-data";

const ROOT = path.resolve(__dirname, "../..");
const USER_ID = "student-1";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const PREFS_ALL: NotificationPreferences = {
  deadlineReminders: true,
  cutoffUpdates: true,
  newBursaryMatches: true,
  gradeWindowReminders: true,
};

/* ------------------------------------------------------------------ *
 * Fixtures, read from the real catalogue
 * ------------------------------------------------------------------ */

/** A target with a published range, so a cutoff comparison has something to compare. */
const TARGET = DEFAULT_CATALOG.universityPrograms.find((p) => getCutoffRange(p.cutoffHistory) !== null);
assert.ok(TARGET, "no university programme with a published cutoff range in the catalogue");

/** An important date every student sees, whatever their targets. */
const OPEN_DATE = DEFAULT_CATALOG.deadlines.find((d) => !d.programIds || d.programIds.length === 0);
assert.ok(OPEN_DATE, "no programme-independent important date in the catalogue");

/** A programme-gated important date, to prove the target filter is applied. */
const GATED_DATE = DEFAULT_CATALOG.deadlines.find((d) => d.programIds && d.programIds.length > 0);
assert.ok(GATED_DATE?.programIds?.[0], "no programme-gated important date in the catalogue");
const GATED_PROGRAM_ID = GATED_DATE.programIds[0];

const PROFILE: StudentProfile = {
  cegepId: "sainte-foy",
  cegepProgramId: "200.B0",
  currentSession: 3,
  rScore: 30,
  rScoreStatus: "confirmed",
  selfTags: ["research", "leadership"],
  targetUniversityProgramIds: [TARGET.id],
  interestIds: [],
  decProfileId: null,
  goalSkipped: false,
  notificationPrefs: DEFAULT_NOTIFICATION_PREFERENCES,
};

/** Local noon on an ISO day, shifted by whole days — the calendar-day clock daysUntil uses. */
function daysFrom(iso: string, offset: number): Date {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return date;
}

/** The reference "now": the open date sits exactly at the far edge of the reminder window. */
const NOW = daysFrom(OPEN_DATE.dateIso, -DEADLINE_REMINDER_WINDOW_DAYS);

const MATCHES = matchBursaries(DEFAULT_CATALOG.bursaries, toStudentContext(PROFILE), NOW);
const MATCHED_WITH_DEADLINE = MATCHES.matched.find((m) => m.bursary.deadlineIso)?.bursary;
const CLOSE_WITH_DEADLINE = MATCHES.close.find((m) => m.bursary.deadlineIso)?.bursary;
const EXPLORE_WITH_DEADLINE = MATCHES.explore.find((m) => m.bursary.deadlineIso)?.bursary;
assert.ok(MATCHED_WITH_DEADLINE, "fixture student matches no dated bursary — revisit PROFILE against BURSARIES");
assert.ok(CLOSE_WITH_DEADLINE, "fixture student is 'close' on no dated bursary — revisit PROFILE against BURSARIES");
assert.ok(EXPLORE_WITH_DEADLINE, "no dated explore-tier bursary — revisit PROFILE against BURSARIES");
assert.ok(MATCHES.matched.length >= 2, "the seen/unseen case needs at least two matched bursaries");
const MATCHED_DEADLINE = MATCHED_WITH_DEADLINE.deadlineIso as string;
const CLOSE_DEADLINE = CLOSE_WITH_DEADLINE.deadlineIso as string;
const EXPLORE_DEADLINE = EXPLORE_WITH_DEADLINE.deadlineIso as string;

function derive(overrides: Partial<DeriveNotificationInput> = {}): DerivedNotification[] {
  return deriveNotificationEvents({
    userId: USER_ID,
    profile: PROFILE,
    catalog: DEFAULT_CATALOG,
    prefs: PREFS_ALL,
    seenBursaryIds: [],
    now: NOW,
    ...overrides,
  });
}

/** A deep copy of the shipped catalogue with one programme's cutoff history rewritten. */
function catalogWith(programId: string, rewrite: (history: CutoffEntry[]) => CutoffEntry[]): ReferenceCatalog {
  const copy = structuredClone(DEFAULT_CATALOG);
  const program = copy.universityPrograms.find((p) => p.id === programId);
  assert.ok(program, `${programId} missing from the catalogue copy`);
  program.cutoffHistory = rewrite(program.cutoffHistory);
  return copy;
}

const shiftedByOne = (history: CutoffEntry[]) => history.map((entry) => ({ ...entry, cutoff: entry.cutoff + 1 }));

function ofKind(events: DerivedNotification[], category: NotificationCategory, subjectId?: string) {
  return events.filter((e) => e.category === category && (subjectId === undefined || e.subjectId === subjectId));
}

function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

let passed = 0;
function check(label: string, fn: () => void) {
  try {
    fn();
  } catch (error) {
    console.error(`  FAIL ${label}`);
    console.error(error);
    process.exit(1);
  }
  passed += 1;
  console.log(`  ok  ${label}`);
}

console.log("notifications self-check\n");
console.log(`      now = ${todayIso(NOW)} (${DEADLINE_REMINDER_WINDOW_DAYS} days before "${OPEN_DATE.id}")`);
console.log(`      target = ${TARGET.id}; matched bursary = ${MATCHED_WITH_DEADLINE.id}; close = ${CLOSE_WITH_DEADLINE.id}\n`);

// --- toggles -------------------------------------------------------------------------
check("all four toggles off → nothing, even with a changed catalogue and unseen matches", () => {
  const events = derive({
    prefs: DEFAULT_NOTIFICATION_PREFERENCES,
    previousCatalog: catalogWith(TARGET.id, shiftedByOne),
  });
  assert.deepEqual(events, []);
});

check("each toggle alone yields only its own category", () => {
  const off = DEFAULT_NOTIFICATION_PREFERENCES;
  const previousCatalog = catalogWith(TARGET.id, shiftedByOne);

  const deadlines = derive({ prefs: { ...off, deadlineReminders: true }, previousCatalog });
  assert.ok(deadlines.length > 0);
  assert.ok(deadlines.every((e) => e.category === "deadline_reminder"));

  const matches = derive({ prefs: { ...off, newBursaryMatches: true }, previousCatalog });
  assert.ok(matches.length > 0);
  assert.ok(matches.every((e) => e.category === "new_bursary_match"));

  const cutoffs = derive({ prefs: { ...off, cutoffUpdates: true }, previousCatalog });
  assert.ok(cutoffs.length > 0);
  assert.ok(cutoffs.every((e) => e.category === "cutoff_update"));

  // The grade-window toggle has nothing honest to fire from (see derive.ts header).
  assert.deepEqual(derive({ prefs: { ...off, gradeWindowReminders: true }, previousCatalog }), []);
});

// --- deadline_reminder: important dates ---------------------------------------------
check("an important date 14 days out is emitted with its title, date, source and verification date", () => {
  const events = derive({ now: daysFrom(OPEN_DATE.dateIso, -14) });
  const [event, ...rest] = ofKind(events, "deadline_reminder", OPEN_DATE.id);
  assert.ok(event, `no reminder for ${OPEN_DATE.id}`);
  assert.equal(rest.length, 0, "one reminder per date");
  assert.deepEqual(event, {
    category: "deadline_reminder",
    subjectType: "deadline",
    subjectId: OPEN_DATE.id,
    subjectSlug: OPEN_DATE.id,
    dedupeKey: `deadline_reminder:${USER_ID}:${OPEN_DATE.id}:${OPEN_DATE.dateIso}`,
    scheduledFor: OPEN_DATE.dateIso,
    deepLink: "/dashboard",
    payload: {
      title: OPEN_DATE.titleFr,
      titleFr: OPEN_DATE.titleFr,
      titleEn: OPEN_DATE.titleEn,
      dateIso: OPEN_DATE.dateIso,
      daysLeft: 14,
      sourceUrl: OPEN_DATE.sourceUrl,
      lastVerifiedAt: OPEN_DATE.lastVerifiedAt,
    },
  });
});

check("the same date 15 days out or yesterday is silent; the day itself still fires", () => {
  assert.equal(ofKind(derive({ now: daysFrom(OPEN_DATE.dateIso, -15) }), "deadline_reminder", OPEN_DATE.id).length, 0);
  assert.equal(ofKind(derive({ now: daysFrom(OPEN_DATE.dateIso, 1) }), "deadline_reminder", OPEN_DATE.id).length, 0);
  const [today] = ofKind(derive({ now: daysFrom(OPEN_DATE.dateIso, 0) }), "deadline_reminder", OPEN_DATE.id);
  assert.ok(today, "a deadline due today must still be reminded");
  assert.equal(today.payload.daysLeft, 0);
});

check("a programme-gated date only reaches a student who targets one of its programmes", () => {
  const now = daysFrom(GATED_DATE.dateIso, -3);
  const targeting = derive({ now, profile: { ...PROFILE, targetUniversityProgramIds: [GATED_PROGRAM_ID] } });
  assert.equal(ofKind(targeting, "deadline_reminder", GATED_DATE.id).length, 1);
  const notTargeting = derive({ now, profile: { ...PROFILE, targetUniversityProgramIds: [] } });
  assert.equal(ofKind(notTargeting, "deadline_reminder", GATED_DATE.id).length, 0);
});

// --- deadline_reminder: bursaries ---------------------------------------------------
check("a matched bursary's deadline 14 days out is a bursary reminder that leads to /bursaries", () => {
  const bursary = MATCHED_WITH_DEADLINE;
  const events = derive({ now: daysFrom(MATCHED_DEADLINE, -14) });
  const [event, ...rest] = ofKind(events, "deadline_reminder", bursary.id);
  assert.ok(event, `no reminder for ${bursary.id}`);
  assert.equal(rest.length, 0);
  assert.deepEqual(event, {
    category: "deadline_reminder",
    subjectType: "bursary",
    subjectId: bursary.id,
    subjectSlug: bursary.id,
    dedupeKey: `deadline_reminder:${USER_ID}:${bursary.id}:${MATCHED_DEADLINE}`,
    scheduledFor: MATCHED_DEADLINE,
    deepLink: "/bursaries",
    payload: {
      title: bursary.name,
      titleFr: bursary.name,
      titleEn: bursary.name,
      foundationName: bursary.sourceOrg,
      dateIso: MATCHED_DEADLINE,
      deadlinePrecision: bursary.deadlinePrecision ?? "day",
      daysLeft: 14,
      sourceUrl: bursary.sourceUrl,
      lastVerifiedAt: bursary.lastVerifiedAt,
    },
  });
  assert.equal(ofKind(derive({ now: daysFrom(MATCHED_DEADLINE, -15) }), "deadline_reminder", bursary.id).length, 0);
  assert.equal(ofKind(derive({ now: daysFrom(MATCHED_DEADLINE, 1) }), "deadline_reminder", bursary.id).length, 0);
});

check("a close-tier bursary is reminded too; an explore-tier one is not", () => {
  const close = ofKind(derive({ now: daysFrom(CLOSE_DEADLINE, -5) }), "deadline_reminder", CLOSE_WITH_DEADLINE.id);
  assert.equal(close.length, 1, `no reminder for close-tier ${CLOSE_WITH_DEADLINE.id}`);
  assert.equal(close[0].payload.daysLeft, 5);
  const explore = ofKind(derive({ now: daysFrom(EXPLORE_DEADLINE, -5) }), "deadline_reminder", EXPLORE_WITH_DEADLINE.id);
  assert.equal(explore.length, 0, `explore-tier ${EXPLORE_WITH_DEADLINE.id} must not be reminded`);
});

// --- new_bursary_match --------------------------------------------------------------
check("a seen matched bursary is suppressed; every unseen one is emitted, dated today", () => {
  const matchedIds = MATCHES.matched.map((m) => m.bursary.id);
  const [seen, ...unseen] = matchedIds;
  const events = ofKind(derive({ seenBursaryIds: [seen] }), "new_bursary_match");

  assert.deepEqual(
    events.map((e) => e.subjectId).sort(compareStrings),
    [...unseen].sort(compareStrings),
  );
  for (const event of events) {
    const bursary = DEFAULT_CATALOG.bursaries.find((b) => b.id === event.subjectId);
    assert.ok(bursary);
    assert.equal(event.subjectType, "bursary");
    assert.equal(event.subjectSlug, bursary.id);
    assert.equal(event.dedupeKey, `new_bursary_match:${USER_ID}:${bursary.id}`);
    assert.equal(event.scheduledFor, todayIso(NOW));
    assert.equal(event.deepLink, "/bursaries");
    assert.equal(event.payload.title, bursary.name);
    assert.equal(event.payload.foundationName, bursary.sourceOrg);
    assert.equal(event.payload.newMatchesCount, 1);
    assert.equal(event.payload.amountMin, bursary.amountMin);
    assert.equal(event.payload.amountMax, bursary.amountMax);
    assert.equal(event.payload.sourceUrl, bursary.sourceUrl);
    assert.equal(event.payload.lastVerifiedAt, bursary.lastVerifiedAt);
  }
});

check("close- and explore-tier bursaries are never announced as matches; all seen → none", () => {
  const events = ofKind(derive(), "new_bursary_match");
  const announced = new Set(events.map((e) => e.subjectId));
  for (const { bursary } of [...MATCHES.close, ...MATCHES.explore]) {
    assert.ok(!announced.has(bursary.id), `${bursary.id} is not matched-tier`);
  }
  const allSeen = MATCHES.matched.map((m) => m.bursary.id);
  assert.equal(ofKind(derive({ seenBursaryIds: allSeen }), "new_bursary_match").length, 0);
});

check("a new match carries daysLeft only while its deadline is still ahead", () => {
  for (const event of ofKind(derive(), "new_bursary_match")) {
    const iso = event.payload.deadlineIso;
    const days = typeof iso === "string" ? daysUntil(iso, NOW) : null;
    if (days !== null && days >= 0) assert.equal(event.payload.daysLeft, days);
    else assert.equal(event.payload.daysLeft, undefined);
  }
});

// --- cutoff_update ------------------------------------------------------------------
check("a target whose published range moved between catalogues emits exactly one cutoff_update", () => {
  const previousCatalog = catalogWith(TARGET.id, shiftedByOne);
  const previousTarget = previousCatalog.universityPrograms.find((p) => p.id === TARGET.id);
  assert.ok(previousTarget);
  const oldRange = getCutoffRange(previousTarget.cutoffHistory);
  const newRange = getCutoffRange(TARGET.cutoffHistory);
  assert.notDeepEqual(oldRange, newRange, "the fixture must actually move the range");

  const updates = ofKind(derive({ previousCatalog }), "cutoff_update");
  assert.equal(updates.length, 1);
  assert.deepEqual(updates[0], {
    category: "cutoff_update",
    subjectType: "university_program",
    subjectId: TARGET.id,
    subjectSlug: TARGET.id,
    dedupeKey: `cutoff_update:${USER_ID}:${TARGET.id}:${DEFAULT_CATALOG.version}`,
    scheduledFor: todayIso(NOW),
    deepLink: `/programs/${TARGET.id}`,
    payload: {
      programName: TARGET.name,
      institution: TARGET.institution,
      oldRange,
      newRange,
      previousCatalogVersion: previousCatalog.version,
      catalogVersion: DEFAULT_CATALOG.version,
      sourceUrl: TARGET.sourceUrl,
      lastVerifiedAt: TARGET.lastVerifiedAt,
    },
  });
});

check("an identical deep copy, no previous catalogue, or the toggle off → no cutoff_update", () => {
  assert.equal(ofKind(derive({ previousCatalog: structuredClone(DEFAULT_CATALOG) }), "cutoff_update").length, 0);
  assert.equal(ofKind(derive({ previousCatalog: null }), "cutoff_update").length, 0);
  assert.equal(ofKind(derive(), "cutoff_update").length, 0);
  const previousCatalog = catalogWith(TARGET.id, shiftedByOne);
  assert.equal(
    ofKind(derive({ previousCatalog, prefs: { ...PREFS_ALL, cutoffUpdates: false } }), "cutoff_update").length,
    0,
  );
});

check("a non-target programme moving, or a target absent from the old catalogue, is not an update", () => {
  const other = DEFAULT_CATALOG.universityPrograms.find(
    (p) => p.id !== TARGET.id && getCutoffRange(p.cutoffHistory) !== null,
  );
  assert.ok(other, "need a second programme with a published range");
  assert.equal(ofKind(derive({ previousCatalog: catalogWith(other.id, shiftedByOne) }), "cutoff_update").length, 0);

  const withoutTarget = structuredClone(DEFAULT_CATALOG);
  withoutTarget.universityPrograms = withoutTarget.universityPrograms.filter((p) => p.id !== TARGET.id);
  assert.equal(ofKind(derive({ previousCatalog: withoutTarget }), "cutoff_update").length, 0);
});

check("a range appearing where none was published counts, with a null old side", () => {
  const [update, ...rest] = ofKind(derive({ previousCatalog: catalogWith(TARGET.id, () => []) }), "cutoff_update");
  assert.ok(update);
  assert.equal(rest.length, 0);
  assert.equal(update.payload.oldRange, null);
  assert.deepEqual(update.payload.newRange, getCutoffRange(TARGET.cutoffHistory));
});

// --- invariants over several runs --------------------------------------------------
const RUNS: DerivedNotification[][] = [
  derive(),
  derive({ previousCatalog: catalogWith(TARGET.id, shiftedByOne) }),
  derive({ now: daysFrom(MATCHED_DEADLINE, -1) }),
  derive({ now: daysFrom(CLOSE_DEADLINE, 0), profile: { ...PROFILE, targetUniversityProgramIds: [GATED_PROGRAM_ID] } }),
];
const ALL_EVENTS = RUNS.flat();
assert.ok(ALL_EVENTS.length > 0, "the invariant runs produced nothing to check");

check("grade_window and counselor_season are never emitted", () => {
  for (const event of ALL_EVENTS) {
    assert.notEqual(event.category, "grade_window");
    assert.notEqual(event.category, "counselor_season");
  }
});

check("no two events in a run share a dedupeKey", () => {
  for (const run of RUNS) {
    assert.equal(new Set(run.map((e) => e.dedupeKey)).size, run.length);
  }
});

check("identical inputs give deep-equal outputs", () => {
  const a = derive({ previousCatalog: catalogWith(TARGET.id, shiftedByOne), now: new Date(NOW.getTime()) });
  const b = derive({ previousCatalog: catalogWith(TARGET.id, shiftedByOne), now: new Date(NOW.getTime()) });
  assert.ok(a.length > 0);
  assert.deepEqual(a, b);
});

check("output is sorted by scheduledFor, then dedupeKey", () => {
  for (const run of RUNS) {
    const sorted = [...run].sort(
      (a, b) => compareStrings(a.scheduledFor, b.scheduledFor) || compareStrings(a.dedupeKey, b.dedupeKey),
    );
    assert.deepEqual(run, sorted);
  }
});

check("scheduledFor is a calendar date and the slug is the catalogue id", () => {
  for (const event of ALL_EVENTS) {
    assert.match(event.scheduledFor, ISO_DATE);
    assert.equal(event.subjectSlug, event.subjectId);
    assert.ok(event.deepLink.startsWith("/"), "a deep link is an in-app path");
  }
});

check("guardrail #1: every payload with a figure or a date carries sourceUrl and lastVerifiedAt", () => {
  for (const event of ALL_EVENTS) {
    const { sourceUrl, lastVerifiedAt } = event.payload;
    assert.equal(typeof sourceUrl, "string", `${event.dedupeKey}: sourceUrl`);
    assert.ok((sourceUrl as string).startsWith("https://"), `${event.dedupeKey}: sourceUrl is a URL`);
    assert.equal(typeof lastVerifiedAt, "string", `${event.dedupeKey}: lastVerifiedAt`);
    assert.match(lastVerifiedAt as string, ISO_DATE, `${event.dedupeKey}: lastVerifiedAt is a date`);
    if (typeof event.payload.dateIso === "string") assert.match(event.payload.dateIso, ISO_DATE);
  }
});

check("guardrail #5: no payload string ranks, recommends, or implies a chance", () => {
  const forbidden = ["tu as tes chances", "très accessible", "cible ambitieuse", "good chance", "tu devrais", "you should", "%"];
  for (const event of ALL_EVENTS) {
    const text = JSON.stringify(event.payload).toLowerCase();
    for (const phrase of forbidden) {
      assert.ok(!text.includes(phrase), `${event.dedupeKey} carries "${phrase}"`);
    }
  }
});

check("`now` is the only clock: derive.ts never calls new Date() without an argument", () => {
  const source = readFileSync(path.join(ROOT, "src/lib/notifications/derive.ts"), "utf8");
  assert.ok(!/new Date\(\s*\)/.test(source));
  assert.ok(!/Date\.now\(/.test(source));
});

check("formatNotificationCopy renders every derived event in both languages", () => {
  for (const event of ALL_EVENTS) {
    for (const locale of ["fr", "en"] as const) {
      const copy = formatNotificationCopy(event.category, event.payload, locale);
      assert.ok(copy.title.length > 0 && copy.body.length > 0, `${event.dedupeKey} (${locale})`);
      switch (event.category) {
        case "deadline_reminder":
          assert.ok(copy.body.includes(String(event.payload.title)));
          assert.ok(copy.body.includes(String(event.payload.daysLeft)));
          break;
        case "new_bursary_match":
          assert.ok(copy.body.includes(String(event.payload.foundationName)));
          break;
        case "cutoff_update":
          assert.ok(copy.body.includes(String(event.payload.programName)));
          break;
      }
    }
  }
});

console.log(`\n${passed} checks passed.`);
