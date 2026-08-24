/**
 * Course impact, derived rather than asserted.
 *
 * The cote Z is the one part of the cote R chain that is genuinely computable from data a
 * student holds: z = (note − moyenne du groupe) / écart-type du groupe. Everything downstream
 * of it (IFG / IFPG group-strength corrections) is held only by the cégeps and the BCI, which
 * is exactly why this product never claims to compute an official cote R — see
 * docs/01-data-architecture.md and guardrail #2.
 *
 * A cote R is a weighted mean of per-course cote Z values. So a course raises the aggregate
 * precisely when its own z sits above the student's mean z, and lowers it when below. That
 * comparison — not an absolute grade — is what "impact" means here.
 */

export type ImpactBand = "strong" | "neutral" | "weak";

export type CourseInput = {
  grade: number;
  groupAverage: number;
  /** Écart-type du groupe. Often absent from a bulletin; the degraded path handles that. */
  groupStdDev?: number | null;
  /** Course weighting (unités). Defaults to 1 when a cégep does not publish it. */
  weight?: number;
};

export type CourseImpact = {
  /** null when the inputs do not support a cote Z (no usable standard deviation). */
  coteZ: number | null;
  band: ImpactBand;
  /** True when computed from raw percentage points rather than a real cote Z. */
  degraded: boolean;
};

/**
 * A course must sit this far from the student's own mean before it is called out as moving
 * the needle. 0.3 σ is a deliberately conservative band: below it the difference is within
 * the noise of a single term's grading and calling it "strong" would be false precision.
 */
const Z_BAND = 0.3;

/** Degraded fallback, in percentage points, when no standard deviation is available. */
const POINTS_BAND = 5;

export function computeCoteZ(input: CourseInput): number | null {
  const { grade, groupAverage, groupStdDev } = input;
  if (groupStdDev === null || groupStdDev === undefined) return null;
  // A zero or near-zero spread makes z undefined (everyone scored identically).
  if (!Number.isFinite(groupStdDev) || groupStdDev < 0.5) return null;
  return (grade - groupAverage) / groupStdDev;
}

function band(delta: number, threshold: number): ImpactBand {
  if (delta >= threshold) return "strong";
  if (delta <= -threshold) return "weak";
  return "neutral";
}

/**
 * Classify every course in a session against that session's own weighted mean.
 * Returns results in the same order as the input.
 */
export function classifySession(courses: CourseInput[]): CourseImpact[] {
  if (courses.length === 0) return [];

  const zValues = courses.map(computeCoteZ);
  const usable = zValues.filter((z): z is number => z !== null);

  // Full path: every course has a usable cote Z, so compare against the weighted mean z.
  if (usable.length === courses.length) {
    const totalWeight = courses.reduce((sum, c) => sum + (c.weight ?? 1), 0);
    const meanZ =
      courses.reduce((sum, c, i) => sum + (zValues[i] as number) * (c.weight ?? 1), 0) /
      totalWeight;

    return courses.map((_, i) => {
      const z = zValues[i] as number;
      return { coteZ: z, band: band(z - meanZ, Z_BAND), degraded: false };
    });
  }

  // Degraded path: no standard deviation, so fall back to distance from the group average
  // in raw percentage points, measured against the student's own mean distance. This is
  // directionally right but ignores how tightly the group clustered — surface it as such.
  const deltas = courses.map((c) => c.grade - c.groupAverage);
  const totalWeight = courses.reduce((sum, c) => sum + (c.weight ?? 1), 0);
  const meanDelta =
    courses.reduce((sum, c, i) => sum + deltas[i] * (c.weight ?? 1), 0) / totalWeight;

  return courses.map((_, i) => ({
    coteZ: zValues[i],
    band: band(deltas[i] - meanDelta, POINTS_BAND),
    degraded: true,
  }));
}
