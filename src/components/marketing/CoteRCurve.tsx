"use client";

import { useEffect, useRef, useState } from "react";

const VIEW_W = 640;
const VIEW_H = 230;
const PAD_X = 24;
const BASELINE = 180;
const AMPLITUDE = 135;
const MU = 0.5;
const SIGMA = 0.16;
const DRAW_KEY = "macote.coteRCurveDrawn"; // sessionStorage: once per session, per the motion spec

function yFor(x01: number): number {
  const z = (x01 - MU) / SIGMA;
  return BASELINE - AMPLITUDE * Math.exp(-(z * z) / 2);
}

function buildPath(): string {
  const points: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const x01 = i / 100;
    const x = PAD_X + x01 * (VIEW_W - PAD_X * 2);
    points.push(`${x.toFixed(1)},${yFor(x01).toFixed(1)}`);
  }
  return `M${points.join("L")}`;
}

const CURVE_PATH = buildPath();
const YOU_X01 = 0.66;
const YOU_X = PAD_X + YOU_X01 * (VIEW_W - PAD_X * 2);
const YOU_Y = yFor(YOU_X01);
const BAND_LOW_X01 = 0.58;
const BAND_HIGH_X01 = 0.74;

export function CoteRCurve({ youLabel, seuilLabel }: { youLabel: string; seuilLabel: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [shouldDraw, setShouldDraw] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alreadyDrawn = false;
    try {
      alreadyDrawn = window.sessionStorage.getItem(DRAW_KEY) === "1";
    } catch {
      alreadyDrawn = true; // storage blocked: prefer the static state over guessing
    }

    if (reduceMotion || alreadyDrawn || !ref.current) return;

    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldDraw(true);
          try {
            window.sessionStorage.setItem(DRAW_KEY, "1");
          } catch {
            /* replays next load if storage is blocked — acceptable */
          }
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${youLabel}, ${seuilLabel}`}
    >
      <path d={CURVE_PATH} fill="none" stroke="var(--color-ink)" strokeOpacity="0.06" strokeWidth="2" />
      <path
        d={CURVE_PATH}
        fill="none"
        stroke="var(--color-ink)"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1}
        style={
          shouldDraw
            ? { strokeDasharray: 1, strokeDashoffset: 0, transition: "stroke-dashoffset 600ms cubic-bezier(0.16,1,0.3,1)" }
            : { strokeDasharray: 1, strokeDashoffset: 1 }
        }
      />

      <line x1={PAD_X} x2={VIEW_W - PAD_X} y1={BASELINE} y2={BASELINE} stroke="var(--color-ink)" strokeOpacity="0.15" strokeWidth="1" />

      <rect
        x={PAD_X + BAND_LOW_X01 * (VIEW_W - PAD_X * 2)}
        y={yFor((BAND_LOW_X01 + BAND_HIGH_X01) / 2) - 4}
        width={(BAND_HIGH_X01 - BAND_LOW_X01) * (VIEW_W - PAD_X * 2)}
        height={BASELINE - (yFor((BAND_LOW_X01 + BAND_HIGH_X01) / 2) - 4)}
        fill="var(--color-ultramarine)"
        fillOpacity="0.08"
      />
      <text
        x={PAD_X + ((BAND_LOW_X01 + BAND_HIGH_X01) / 2) * (VIEW_W - PAD_X * 2)}
        y={BASELINE + 22}
        textAnchor="middle"
        fill="var(--color-secondary)"
        fontSize="13"
      >
        {seuilLabel}
      </text>

      <g>
        <circle cx={YOU_X} cy={YOU_Y} r="8" fill="var(--color-paper)" />
        <circle cx={YOU_X} cy={YOU_Y} r="5.5" fill="var(--color-moss)" />
        <text x={YOU_X + 14} y={YOU_Y + 4} fill="var(--color-moss)" fontSize="14" fontWeight="700">
          {youLabel}
        </text>
      </g>
    </svg>
  );
}
