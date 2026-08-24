"use client";

import { useState } from "react";

// Local design harness: renders real routes at true device viewports so mobile layout
// can be checked on a desktop (and on Windows, where the iOS Simulator can't run).
// Not linked from app navigation — reach it directly at /dev/preview.

const DEVICES = [
  { id: "se", label: "iPhone SE", width: 375, height: 667 },
  { id: "14pro", label: "iPhone 14 Pro", width: 393, height: 852 },
  { id: "promax", label: "iPhone 16 Pro Max", width: 440, height: 956 },
  { id: "pixel", label: "Pixel 8", width: 412, height: 915 },
] as const;

const SCREENS = [
  { n: "01", label: "Accueil public", path: "/" },
  { n: "02", label: "La bifurcation", path: "/onboarding/score" },
  { n: "03", label: "Saisie", path: "/onboarding/score/confirm" },
  { n: "04", label: "Estimation", path: "/onboarding/score/estimate" },
  { n: "05", label: "Résultats", path: "/onboarding/results?score=28.4&status=confirmed" },
  { n: "06", label: "Ton cégep", path: "/onboarding/cegep" },
  { n: "07", label: "Compte", path: "/onboarding/account" },
  { n: "08", label: "Tableau de bord", path: "/dashboard" },
  { n: "09", label: "Programmes", path: "/programs" },
  { n: "10", label: "Fiche programme", path: "/programs/hec-baa" },
  { n: "11", label: "Bourses", path: "/bursaries" },
  { n: "12", label: "Profil", path: "/profile" },
];

export default function DevPreviewPage() {
  const [device, setDevice] = useState<(typeof DEVICES)[number]>(DEVICES[1]);
  const [zoom, setZoom] = useState(0.85);

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-ink">
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-[#f4f4f2]/95 px-6 py-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-[20px] font-bold tracking-tight">
              MaCote — aperçu mobile
            </h1>
            <p className="text-[12px] text-ink/55">
              {device.width} × {device.height} · {SCREENS.length} écrans
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 rounded-full bg-ink p-1">
              {DEVICES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDevice(d)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    device.id === d.id ? "bg-paper text-ink" : "text-paper/60 hover:text-paper"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-[11px] font-semibold text-ink/60">
              Zoom
              <input
                type="range"
                min={0.5}
                max={1}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-28"
              />
              <span className="w-9 tabular-nums">{Math.round(zoom * 100)}%</span>
            </label>
          </div>
        </div>
      </header>

      <div className="overflow-x-auto px-6 py-8">
        <div className="flex items-start gap-7" style={{ width: "max-content" }}>
          {SCREENS.map((screen) => (
            <figure key={screen.n} className="m-0 flex flex-col gap-3">
              <figcaption className="flex items-baseline gap-2 text-[12px]">
                <span className="font-semibold text-ultramarine tabular-nums">{screen.n}</span>
                <span className="text-ink/70">{screen.label}</span>
              </figcaption>

              <div
                className="overflow-hidden rounded-[36px] border-[10px] border-ink bg-ink shadow-overlay"
                style={{
                  width: device.width * zoom + 20,
                  height: device.height * zoom + 20,
                }}
              >
                <iframe
                  src={screen.path}
                  title={`${screen.n} ${screen.label}`}
                  width={device.width}
                  height={device.height}
                  className="origin-top-left border-0 bg-chalk"
                  style={{
                    transform: `scale(${zoom})`,
                    width: device.width,
                    height: device.height,
                  }}
                />
              </div>

              <a
                href={screen.path}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-ink/45 underline-offset-2 hover:text-ink hover:underline"
              >
                {screen.path}
              </a>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
