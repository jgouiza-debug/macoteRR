/**
 * Shared cote R display domain. The curve and the compact axis rows must agree on this,
 * otherwise the same score appears at two different positions across the app.
 * Cote R runs roughly 15-35 in practice; this window frames that with headroom.
 */
export const R_MIN = 16;
export const R_MAX = 36;
export const R_MEAN = 26;
export const R_SIGMA = 4;

export function clampScore(r: number): number {
  return Math.min(R_MAX, Math.max(R_MIN, r));
}

/** Position of a score within the display domain, as a 0-100 percentage. */
export function scorePercent(r: number): number {
  return ((clampScore(r) - R_MIN) / (R_MAX - R_MIN)) * 100;
}
