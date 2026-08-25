import { scorePercent } from "@/lib/rscore/scale";
import { compareToCutoffRange, type CutoffRange } from "@/lib/rscore/cutoff-range";

/**
 * Compressed 1px axis with a band (published range) and a dot (student position) — the
 * list-row counterpart to DistributionCurve. Shares its domain so positions stay consistent.
 * `range` is null when nothing is verified yet: renders a hatched placeholder, no claim.
 */
export function AxisRow({ score, range }: { score: number; range: CutoffRange | null }) {
  const scoreLeft = scorePercent(score);
  const status = compareToCutoffRange(score, range);
  const dotColor = status === "above" ? "bg-moss" : status === "below" ? "bg-ember" : status === "inside" ? "bg-ultramarine" : "bg-ink/30";

  return (
    <div className="relative h-3 w-full">
      <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-ink/15" />
      {range ? (
        <div
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-sm bg-ink/12"
          style={{
            left: `${scorePercent(range.low)}%`,
            width: `${Math.max(scorePercent(range.high) - scorePercent(range.low), 1.5)}%`,
          }}
        />
      ) : (
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ink/30"
          style={{ left: "50%" }}
        />
      )}
      <div
        className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-paper ${dotColor}`}
        style={{ left: `${scoreLeft}%` }}
      />
    </div>
  );
}
