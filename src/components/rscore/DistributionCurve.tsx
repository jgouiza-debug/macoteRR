"use client";

import { useEffect, useSyncExternalStore } from "react";
import { R_MAX, R_MEAN, R_MIN, R_SIGMA, clampScore } from "@/lib/rscore/scale";
import { compareToCutoffRange, type CutoffRange } from "@/lib/rscore/cutoff-range";

// Geometry is expressed in a fixed viewBox and rendered with the default
// (uniform) preserveAspectRatio, so the marker stays a true circle at every width.
// Marker coordinates come from the same curve function that draws the path, which
// is what keeps the dot sitting exactly on the line instead of near it.
const VIEW_W = 320;
const VIEW_H = 168;
const PAD_X = 14;
const BASELINE = 140;
const AMPLITUDE = 104;

const MU = R_MEAN;
const SIGMA = R_SIGMA;
const PLOT_W = VIEW_W - PAD_X * 2;

const DRAW_FLAG = "macote.curveDrawn";

function xFor(r: number): number {
  return PAD_X + ((clampScore(r) - R_MIN) / (R_MAX - R_MIN)) * PLOT_W;
}

function yFor(r: number): number {
  const z = (clampScore(r) - MU) / SIGMA;
  return BASELINE - AMPLITUDE * Math.exp(-(z * z) / 2);
}

function buildCurvePath(): string {
  const points: string[] = [];
  for (let r = R_MIN; r <= R_MAX + 0.001; r += 0.2) {
    points.push(`${xFor(r).toFixed(2)},${yFor(r).toFixed(2)}`);
  }
  return `M${points.join("L")}`;
}

const CURVE_PATH = buildCurvePath();
const AREA_PATH = `${CURVE_PATH}L${xFor(R_MAX).toFixed(2)},${BASELINE}L${xFor(R_MIN).toFixed(2)},${BASELINE}Z`;

// The draw-in is the product's single authored moment: it plays once per account, then
// never again — not on tab return, not on re-render, not on back navigation.
const flagListeners = new Set<() => void>();

function subscribeDrawn(listener: () => void) {
  flagListeners.add(listener);
  return () => flagListeners.delete(listener);
}

function readDrawn(): boolean {
  try {
    return window.localStorage.getItem(DRAW_FLAG) === "1";
  } catch {
    return true; // Storage blocked: prefer the static state over replaying the animation.
  }
}

// Server has no storage; render the settled state so the markup never shows a half-drawn curve.
function serverDrawn(): boolean {
  return true;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function DistributionCurve({
  score,
  range,
  caption,
  youLabel = "toi",
  rangeLabel,
  animate = false,
}: {
  score: number;
  /** null when nothing is verified yet — renders a hatched placeholder, no comparison claim. */
  range: CutoffRange | null;
  caption?: string;
  youLabel?: string;
  /** Fully composed by the caller (locale + year formatting), e.g. "seuil 2020–2022". */
  rangeLabel: string;
  /** Opt in on the results screen only — the one place the authored draw belongs. */
  animate?: boolean;
}) {
  const alreadyDrawn = useSyncExternalStore(subscribeDrawn, readDrawn, serverDrawn);
  const shouldDraw = animate && !alreadyDrawn && !prefersReducedMotion();

  useEffect(() => {
    if (!animate || alreadyDrawn) return;
    try {
      window.localStorage.setItem(DRAW_FLAG, "1");
    } catch {
      /* storage blocked — the animation simply replays next visit */
    }
  }, [animate, alreadyDrawn]);

  const status = compareToCutoffRange(score, range);
  const markerColor =
    status === "above" ? "var(--color-moss)" : status === "below" ? "var(--color-ember)" : status === "inside" ? "var(--color-ultramarine)" : "var(--color-ink)";

  const xScore = xFor(score);
  const yScore = yFor(score);
  const xLow = range ? xFor(range.low) : xFor(score);
  const xHigh = range ? xFor(range.high) : xFor(score);
  const xBandCenter = (xLow + xHigh) / 2;
  const bandTop = range ? Math.min(yFor(range.low), yFor(range.high)) - 6 : BASELINE - 6;

  // Flip the label to the inside edge near a boundary so it can never be clipped.
  const labelOnRight = xScore < VIEW_W - 70;
  const labelX = labelOnRight ? xScore + 12 : xScore - 12;

  return (
    <figure className={`m-0 flex w-full flex-col gap-3 ${shouldDraw ? "curve-draw" : ""}`}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${youLabel} ${score.toFixed(1).replace(".", ",")}, ${rangeLabel}`}
      >
        <path d={AREA_PATH} fill="var(--color-ink)" fillOpacity="0.04" className="curve-area" />
        <path
          d={CURVE_PATH}
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity="0.5"
          strokeWidth="2"
          strokeLinecap="round"
          className="curve-line"
        />

        <line
          x1={PAD_X}
          x2={VIEW_W - PAD_X}
          y1={BASELINE}
          y2={BASELINE}
          stroke="var(--color-ink)"
          strokeOpacity="0.18"
          strokeWidth="1"
        />

        {range ? (
          <rect
            x={Math.min(xLow, xHigh)}
            y={bandTop}
            width={Math.max(Math.abs(xHigh - xLow), 2)}
            height={BASELINE - bandTop}
            fill="var(--color-ink)"
            fillOpacity="0.08"
          />
        ) : (
          <line
            x1={xBandCenter}
            x2={xBandCenter}
            y1={bandTop}
            y2={BASELINE}
            stroke="var(--color-ink)"
            strokeOpacity="0.35"
            strokeDasharray="2 3"
            strokeWidth="1.25"
          />
        )}
        <text
          x={xBandCenter}
          y={BASELINE + 16}
          textAnchor="middle"
          fill="var(--color-ink)"
          fillOpacity="0.55"
          fontSize="11.5"
        >
          {rangeLabel}
        </text>

        <g className="curve-marker">
          <circle cx={xScore} cy={yScore} r="8" fill="var(--color-paper)" />
          <circle cx={xScore} cy={yScore} r="5.5" fill={markerColor} />
          <text
            x={labelX}
            y={yScore + 4}
            textAnchor={labelOnRight ? "start" : "end"}
            fill={markerColor}
            fontSize="12.5"
            fontWeight="700"
          >
            {youLabel}
          </text>
        </g>
      </svg>

      {caption && (
        <figcaption className="border-t border-ink/10 pt-3 text-center text-[11px] leading-relaxed text-ink/50">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
