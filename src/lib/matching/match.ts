import type { SelfTagId } from "@/lib/tags/taxonomy";
import { daysUntil } from "@/lib/dates";

/**
 * Deterministic, rules-based bursary matching. Implements the six-step evaluation and the
 * three-tier result from docs/03-bursary-matching-system.md exactly.
 *
 * Explicit non-goals, restated from that doc: no ML, no ranking score beyond the tiers, and
 * no "success probability" — the product has no data to back such a number and it would read
 * as false precision on something that materially affects a student's finances.
 */

export type BursaryCriteria = {
  id: string;
  /** null = province-wide / open to any cégep. */
  cegepId: string | null;
  eligibleCegepPrograms: string[] | null;
  eligibleUniversityPrograms: string[] | null;
  minRScore: number | null;
  minSession: number | null;
  tagCriteria: SelfTagId[] | null;
  deadlineIso: string | null;
  amountMax: number | null;
};

export type StudentContext = {
  cegepId: string | null;
  cegepProgramId: string | null;
  currentSession: number | null;
  /** Most recent score, confirmed or estimated — whichever is more recent. */
  rScore: number | null;
  selfTags: SelfTagId[];
  targetUniversityProgramIds: string[];
};

export type MatchTier = "matched" | "close" | "explore";

export type MatchReasonKind =
  | "cegep"
  | "program"
  | "rscore"
  | "tag"
  | "target"
  | "open"
  | "rscore_gap";

export type MatchReason = {
  kind: MatchReasonKind;
  /** Set for `tag` reasons so the UI can name the specific tag. */
  tagId?: SelfTagId;
  /** Set for `rscore_gap` so the UI can say how far off the student is. */
  gap?: number;
};

export type BursaryMatch<T extends BursaryCriteria> = {
  bursary: T;
  tier: MatchTier;
  reasons: MatchReason[];
};

/** Within this many cote R points, a miss is "not yet, but on track" rather than excluded. */
const R_SCORE_NEAR_MISS = 2;

type Evaluation = { tier: MatchTier; reasons: MatchReason[] } | null;

function evaluate(bursary: BursaryCriteria, student: StudentContext): Evaluation {
  const reasons: MatchReason[] = [];
  let softMiss = false;

  // 1. Cégep match — hard gate. A null cegepId is open to anyone.
  if (bursary.cegepId !== null) {
    if (student.cegepId !== bursary.cegepId) return null;
    reasons.push({ kind: "cegep" });
  }

  // 2. Program match — hard gate.
  if (bursary.eligibleCegepPrograms && bursary.eligibleCegepPrograms.length > 0) {
    if (
      !student.cegepProgramId ||
      !bursary.eligibleCegepPrograms.includes(student.cegepProgramId)
    ) {
      return null;
    }
    reasons.push({ kind: "program" });
  }

  // 5. Session threshold — hard gate. A first-session student genuinely cannot apply
  //    to a final-year-only bursary yet. (Evaluated early: it is a true exclusion.)
  if (bursary.minSession !== null) {
    if (student.currentSession === null || student.currentSession < bursary.minSession) {
      return null;
    }
  }

  // 3. Target-program match — soft. A student may simply not have added the target yet,
  //    so this down-ranks rather than excludes.
  if (bursary.eligibleUniversityPrograms && bursary.eligibleUniversityPrograms.length > 0) {
    const hasTarget = bursary.eligibleUniversityPrograms.some((id) =>
      student.targetUniversityProgramIds.includes(id),
    );
    if (hasTarget) {
      reasons.push({ kind: "target" });
    } else {
      softMiss = true;
    }
  }

  // 4. R-score threshold — soft within R_SCORE_NEAR_MISS, excluded beyond it.
  if (bursary.minRScore !== null) {
    if (student.rScore === null) {
      softMiss = true;
    } else if (student.rScore >= bursary.minRScore) {
      reasons.push({ kind: "rscore" });
    } else {
      const gap = bursary.minRScore - student.rScore;
      if (gap > R_SCORE_NEAR_MISS) return null;
      reasons.push({ kind: "rscore_gap", gap });
      softMiss = true;
    }
  }

  // 6. Tag overlap — never excludes. Tags are incomplete by nature: a student who forgot
  //    to tag "sports" should not lose access to a sports bursary. Overlap is a positive
  //    signal only.
  if (bursary.tagCriteria && bursary.tagCriteria.length > 0) {
    for (const tagId of bursary.tagCriteria) {
      if (student.selfTags.includes(tagId)) reasons.push({ kind: "tag", tagId });
    }
  }

  const hasNoCriteria =
    bursary.cegepId === null &&
    !bursary.eligibleCegepPrograms?.length &&
    !bursary.eligibleUniversityPrograms?.length &&
    bursary.minRScore === null &&
    bursary.minSession === null;

  // Province-wide / open bursaries are always shown as an Explore baseline.
  if (hasNoCriteria) return { tier: "explore", reasons: [{ kind: "open" }] };

  return { tier: softMiss ? "close" : "matched", reasons };
}

/** Deadline proximity first, amount second — per the spec's sort order. */
function compare<T extends BursaryCriteria>(
  a: BursaryMatch<T>,
  b: BursaryMatch<T>,
  today: Date,
): number {
  // Calendar days in local time (src/lib/dates.ts), the same clock the dashboard's
  // "DANS 3 JOURS" uses, so a deadline never reads as upcoming on one screen and past on another.
  const key = (iso: string | null) => {
    if (!iso) return Infinity;
    const days = daysUntil(iso, today);
    if (days === null) return Infinity;
    // Past deadlines sink below upcoming ones rather than sorting to the top.
    return days < 0 ? Infinity : days;
  };
  const aKey = key(a.bursary.deadlineIso);
  const bKey = key(b.bursary.deadlineIso);
  if (aKey !== bKey) return aKey - bKey;

  return (b.bursary.amountMax ?? 0) - (a.bursary.amountMax ?? 0);
}

export function matchBursaries<T extends BursaryCriteria>(
  bursaries: T[],
  student: StudentContext,
  today: Date = new Date(),
): Record<MatchTier, BursaryMatch<T>[]> {
  const result: Record<MatchTier, BursaryMatch<T>[]> = {
    matched: [],
    close: [],
    explore: [],
  };

  for (const bursary of bursaries) {
    const evaluation = evaluate(bursary, student);
    if (!evaluation) continue;
    result[evaluation.tier].push({
      bursary,
      tier: evaluation.tier,
      reasons: evaluation.reasons,
    });
  }

  for (const tier of ["matched", "close", "explore"] as const) {
    result[tier].sort((a, b) => compare(a, b, today));
  }

  return result;
}
