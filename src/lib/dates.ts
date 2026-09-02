/**
 * Calendar-day arithmetic on the ISO dates the catalogue uses ("2027-03-01").
 *
 * Everything compares calendar days in the student's local time, never UTC instants: a
 * deadline "today" must read as today until midnight where the student is, and a deadline
 * that passed yesterday must sort as past even if it is still today in UTC. Both the
 * dashboard's "DANS 3 JOURS" and the bursary matcher's "past deadlines sink" rule go through
 * here so the two can never disagree.
 */

/** Whole days from `today` to an ISO date. null when the date does not parse. */
export function daysUntil(iso: string, today: Date = new Date()): number | null {
  const target = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

/** True when the calendar day is strictly before today. An unparseable date is not "past". */
export function isPastIso(iso: string, today: Date = new Date()): boolean {
  const days = daysUntil(iso, today);
  return days !== null && days < 0;
}

/** Today as "YYYY-MM-DD" in local time. */
export function todayIso(today: Date = new Date()): string {
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
