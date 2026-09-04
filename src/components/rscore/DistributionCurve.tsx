"use client";

import { useEffect, useRef, useState, memo } from "react";
import { clampScore, R_MAX, R_MIN } from "@/lib/rscore/scale";
import { compareToCutoffRange, type CutoffRange } from "@/lib/rscore/cutoff-range";
import { useFormat } from "@/lib/i18n/useFormat";

const VIEW_W = 312;
const VIEW_H = 130;
const BASELINE_Y = 98;

export const BELL_CURVE_PATH =
  "M0,98 C62,98 86,96 106,76 C122,60 138,30 156,30 C174,30 190,60 206,76 C226,96 250,98 312,98";

export const BELL_AREA_PATH = `${BELL_CURVE_PATH} L312,98 L0,98 Z`;

type CubicSegment = {
  p0: [number, number];
  p1: [number, number];
  p2: [number, number];
  p3: [number, number];
};

const BEZIER_SEGMENTS: CubicSegment[] = [
  { p0: [0, 98], p1: [62, 98], p2: [86, 96], p3: [106, 76] },
  { p0: [106, 76], p1: [122, 60], p2: [138, 30], p3: [156, 30] },
  { p0: [156, 30], p1: [174, 30], p2: [190, 60], p3: [206, 76] },
  { p0: [206, 76], p1: [226, 96], p2: [250, 98], p3: [312, 98] },
];

function sampleCubic(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

export function xForScore(score: number): number {
  const clamped = clampScore(score);
  return ((clamped - R_MIN) / (R_MAX - R_MIN)) * VIEW_W;
}

export function yForX(targetX: number): number {
  const x = Math.max(0, Math.min(VIEW_W, targetX));
  const seg =
    BEZIER_SEGMENTS.find((s) => x >= s.p0[0] && x <= s.p3[0]) ??
    (x <= 0 ? BEZIER_SEGMENTS[0] : BEZIER_SEGMENTS[BEZIER_SEGMENTS.length - 1]);

  let low = 0;
  let high = 1;
  let t = 0.5;
  for (let i = 0; i < 16; i++) {
    t = (low + high) / 2;
    const curX = sampleCubic(seg.p0[0], seg.p1[0], seg.p2[0], seg.p3[0], t);
    if (curX < x) low = t;
    else high = t;
  }
  return sampleCubic(seg.p0[1], seg.p1[1], seg.p2[1], seg.p3[1], t);
}

const REVEAL_STORAGE_KEY = "macote.has_seen_curve_reveal";

export const DistributionCurve = memo(function DistributionCurve({
  score,
  range,
  caption,
  youLabel,
  rangeLabel,
  estimated = false,
}: {
  score: number;
  /** null when nothing is verified yet — renders a hatched placeholder, no comparison claim. */
  range: CutoffRange | null;
  caption?: string;
  /** Localised by the caller (`t("common.toi")`); required so nothing falls back to French. */
  youLabel: string;
  /**
   * Fully composed by the caller, word included — `${t("common.seuil")} ${formatRangeYears(range)}`
   * — so the annotation reads "seuil 2020–2022" in French and "cutoff 2020–2022" in English.
   * Rendered exactly as given: nothing is prefixed here.
   */
  rangeLabel: string;
  /**
   * True when `score` is an estimate. The marker label then carries the leading "≈ " like
   * every other place the figure appears (guardrail #2): the curve must never turn an
   * estimate into a confirmed-looking number.
   */
  estimated?: boolean;
}) {
  const status = compareToCutoffRange(score, range);
  const markerColor =
    status === "above"
      ? "var(--color-moss)"
      : status === "below"
        ? "var(--color-ember)"
        : status === "inside"
          ? "var(--color-moss)"
          : "var(--color-ultramarine)";

  const xScore = xForScore(score);
  const yScore = yForX(xScore);

  const xCutoff = range ? xForScore((range.low + range.high) / 2) : null;
  const yCutoff = xCutoff !== null ? yForX(xCutoff) : null;

  const labelOnRight = xScore < VIEW_W - 75;
  const labelX = labelOnRight ? xScore + 10 : xScore - 10;
  const labelAnchor = labelOnRight ? "start" : "end";

  const pathRef = useRef<SVGPathElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [pathLength, setPathLength] = useState(340);
  const f = useFormat();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Accessibility check: skip animation under prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Run exactly once per account
    const hasSeen = localStorage.getItem(REVEAL_STORAGE_KEY) === "1";
    if (!hasSeen) {
      if (pathRef.current) {
        try {
          const len = pathRef.current.getTotalLength();
          if (len > 0) setPathLength(len);
        } catch {
          /* ignore measurement failure */
        }
      }
      setShouldAnimate(true);
      try {
        localStorage.setItem(REVEAL_STORAGE_KEY, "1");
      } catch {
        /* ignore storage failure */
      }
    }
  }, []);

  // Same Intl formatter as the position block beside the curve, so "32,5" and "32.5" never
  // share a screen; an estimate keeps its "≈ " here too (guardrail #2).
  const formattedScore = f.score(score);
  const studentFullLabel = `${youLabel}, ${estimated ? "≈ " : ""}${formattedScore}`;

  return (
    <figure className="m-0 flex w-full flex-col gap-2.5 [content-visibility:auto] [contain-intrinsic-size:0_160px]">
      <div className="w-full rounded border border-ink/12 bg-paper px-3 pb-3 pt-3.5 shadow-card">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`${studentFullLabel} — ${rangeLabel}`}
        >
          {shouldAnimate && (
            <style>{`
              @keyframes curveDrawAnim {
                0% { stroke-dashoffset: ${pathLength}; }
                100% { stroke-dashoffset: 0; }
              }
              @keyframes cutoffFadeAnim {
                0% { opacity: 0; }
                100% { opacity: 1; }
              }
              @keyframes markerGrowAnim {
                0% { opacity: 0; transform: scaleY(0.96); }
                100% { opacity: 1; transform: scaleY(1); }
              }
              @keyframes markerPopAnim {
                0% { opacity: 0; transform: scale(0.96); }
                100% { opacity: 1; transform: scale(1); }
              }
            `}</style>
          )}

          {/* Background area under the bell curve (7% ink opacity) */}
          <path d={BELL_AREA_PATH} fill="var(--color-ink)" fillOpacity="0.07" />

          {/* Static Baseline (1px, 30% ink opacity) */}
          <line
            x1={0}
            y1={BASELINE_Y}
            x2={VIEW_W}
            y2={BASELINE_Y}
            stroke="var(--color-ink)"
            strokeOpacity="0.30"
            strokeWidth="1"
          />

          {/* Bell Curve Stroke (1.5px, round cap, animated 0-520ms) */}
          <path
            ref={pathRef}
            d={BELL_CURVE_PATH}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="1.5"
            strokeLinecap="round"
            style={
              shouldAnimate
                ? {
                    strokeDasharray: pathLength,
                    strokeDashoffset: pathLength,
                    animation: "curveDrawAnim 520ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
                  }
                : undefined
            }
          />

          {/* Cutoff mark (1.5px dashed vertical line + label, faded in 0-250ms) */}
          {xCutoff !== null && yCutoff !== null && (
            <g
              style={
                shouldAnimate
                  ? {
                      opacity: 0,
                      animation: "cutoffFadeAnim 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
                    }
                  : undefined
              }
            >
              <line
                x1={xCutoff}
                y1={BASELINE_Y}
                x2={xCutoff}
                y2={yCutoff}
                stroke="var(--color-ink)"
                strokeOpacity="0.8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text
                // Anchored at the line it names, on whichever side has room.
                x={xCutoff < VIEW_W / 3 ? xCutoff + 4 : xCutoff - 4}
                y={BASELINE_Y + 14}
                textAnchor={xCutoff < VIEW_W / 3 ? "start" : "end"}
                fill="var(--color-secondary)"
                fontSize="11"
                fontFamily="var(--font-sans), sans-serif"
                className="tabular-nums"
              >
                {rangeLabel}
              </text>
            </g>
          )}

          {/* Student Mark (2px solid line + 5.5px circle + label, animated 280-600ms) */}
          <g>
            {/* Growing vertical stem */}
            <line
              x1={xScore}
              y1={BASELINE_Y}
              x2={xScore}
              y2={yScore}
              stroke={markerColor}
              strokeWidth="2"
              style={
                shouldAnimate
                  ? {
                      opacity: 0,
                      transformOrigin: `${xScore}px ${BASELINE_Y}px`,
                      animation:
                        "markerGrowAnim 320ms cubic-bezier(0.16, 1, 0.3, 1) 280ms forwards",
                    }
                  : undefined
              }
            />

            {/* Dot + Label popping in at the same moment stem reaches the curve */}
            <g
              style={
                shouldAnimate
                  ? {
                      opacity: 0,
                      transformOrigin: `${xScore}px ${yScore}px`,
                      animation:
                        "markerPopAnim 320ms cubic-bezier(0.16, 1, 0.3, 1) 280ms forwards",
                    }
                  : undefined
              }
            >
              {/* Paper backing ring for crisp contrast */}
              <circle cx={xScore} cy={yScore} r="7" fill="var(--color-paper)" />
              {/* 5.5px filled dot */}
              <circle cx={xScore} cy={yScore} r="5.5" fill={markerColor} />

              <text
                x={labelX}
                y={yScore + 4}
                textAnchor={labelAnchor}
                fill={markerColor}
                fontSize="12"
                fontWeight="600"
                fontFamily="var(--font-sans), sans-serif"
                className="tabular-nums"
              >
                {studentFullLabel}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {caption && (
        <figcaption className="text-center text-[11px] leading-relaxed text-ink/50">
          {caption}
        </figcaption>
      )}
    </figure>
  );
});
