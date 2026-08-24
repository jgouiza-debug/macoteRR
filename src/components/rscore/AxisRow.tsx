import { scorePercent } from "@/lib/rscore/scale";

/**
 * Compressed 1px axis with a tick (cutoff) and a dot (student position) — the list-row
 * counterpart to DistributionCurve. Shares its domain so positions stay consistent.
 */
export function AxisRow({ score, cutoff }: { score: number; cutoff: number }) {
  const scoreLeft = scorePercent(score);
  const cutoffLeft = scorePercent(cutoff);
  const clears = score >= cutoff;

  return (
    <div className="relative h-3 w-full">
      <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-ink/15" />
      <div
        className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-ink/45"
        style={{ left: `${cutoffLeft}%` }}
      />
      <div
        className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-paper ${
          clears ? "bg-moss" : "bg-ember"
        }`}
        style={{ left: `${scoreLeft}%` }}
      />
    </div>
  );
}
