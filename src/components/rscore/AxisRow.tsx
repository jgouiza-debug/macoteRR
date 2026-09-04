import { memo } from "react";
import { R_MAX, R_MIN, scorePercent } from "@/lib/rscore/scale";
import { compareToCutoffRange, type CutoffRange } from "@/lib/rscore/cutoff-range";

/**
 * Compressed 1px axis with a band (published range) and a dot (student position) — the
 * list-row counterpart to DistributionCurve. Shares its domain so positions stay consistent.
 * `range` is null when nothing is verified yet: renders a hatched placeholder, no claim.
 */
export const AxisRow = memo(function AxisRow({
  score,
  range,
}: {
  score?: number | null;
  range: CutoffRange | null;
}) {
  const hasScore = score !== null && score !== undefined;
  const scoreLeft = hasScore ? scorePercent(score) : null;
  const status = hasScore ? compareToCutoffRange(score, range) : "unverified";
  const dotColor =
    status === "above"
      ? "bg-moss"
      : status === "below"
        ? "bg-ember"
        : status === "inside"
          ? "bg-ultramarine"
          : "bg-ink/30";

  return (
    // The scale's ends are printed so the track reads as a gauge with a domain, not a slider.
    <div className="flex w-full items-center gap-1.5">
      <span className="w-4 text-right text-[9px] leading-none tabular-nums text-ink/40" aria-hidden="true">
        {R_MIN}
      </span>
      <div className="relative h-3 min-w-0 flex-1">
      <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-ink/15" />
      {range && range.kind === "floor" ? (
        // A published minimum is one figure: a tick, so the legend's "bar" never lies.
        <div
          className="absolute top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-ink/45"
          style={{ left: `${scorePercent(range.low)}%` }}
        />
      ) : range ? (
        <div
          // A narrow published range still has to read as a bar, not a speck.
          className="absolute top-1/2 h-2 -translate-y-1/2 rounded-sm bg-ink/25"
          style={{
            left: `${scorePercent(range.low)}%`,
            width: `${Math.max(scorePercent(range.high) - scorePercent(range.low), 3)}%`,
          }}
        />
      ) : (
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ink/30"
          style={{ left: "50%" }}
        />
      )}
      {scoreLeft !== null && (
        <div
          className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-paper ${dotColor}`}
          style={{ left: `${scoreLeft}%` }}
        />
      )}
      </div>
      <span className="w-4 text-[9px] leading-none tabular-nums text-ink/40" aria-hidden="true">
        {R_MAX}
      </span>
    </div>
  );
});
