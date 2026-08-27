"use client";

import { memo, useMemo, useState, useSyncExternalStore, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { AxisRow } from "@/components/rscore/AxisRow";
import { UNIVERSITY_PROGRAMS, type UniversityProgram } from "@/lib/sample-data";
import {
  compareToCutoffRange,
  getCutoffRange,
  formatRangeYears,
  type CutoffRange,
  type CutoffStatus,
} from "@/lib/rscore/cutoff-range";
import { useStudentProfile } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";

const TIERS: CutoffStatus[] = ["above", "inside", "below", "unknown"];

const CUTOFF_STATUS_COLOR_CLASS: Record<CutoffStatus, string> = {
  above: "text-moss",
  inside: "text-ultramarine",
  below: "text-ember",
  unknown: "text-ink/40",
};

const CUTOFF_STATUS_LABEL_KEY: Record<CutoffStatus, "cutoff.above" | "cutoff.inside" | "cutoff.below" | "cutoff.unverified"> = {
  above: "cutoff.above",
  inside: "cutoff.inside",
  below: "cutoff.below",
  unknown: "cutoff.unverified",
};

const CUTOFF_STATUS_ORDER: Record<CutoffStatus, number> = {
  above: 0,
  inside: 1,
  below: 2,
  unknown: 3,
};

const UNIVERSITIES_FILTER = [
  { id: "all", label: "Toutes les universités" },
  { id: "Université Laval", label: "ULaval" },
  { id: "Université de Montréal", label: "UdeM" },
  { id: "McGill University", label: "McGill" },
  { id: "HEC Montréal", label: "HEC" },
  { id: "Polytechnique Montréal", label: "Polytechnique" },
  { id: "Université de Sherbrooke", label: "UdeS" },
  { id: "Concordia University", label: "Concordia" },
  { id: "Université du Québec à Montréal (UQAM)", label: "UQAM" },
  { id: "École de technologie supérieure (ÉTS)", label: "ÉTS" },
  { id: "Université du Québec à Trois-Rivières (UQTR)", label: "UQTR" },
  { id: "Université du Québec à Chicoutimi (UQAC)", label: "UQAC" },
  { id: "Université du Québec à Rimouski (UQAR)", label: "UQAR" },
  { id: "Université du Québec en Outaouais (UQO)", label: "UQO" },
  { id: "Université du Québec en Abitibi-Témiscamingue (UQAT)", label: "UQAT" },
  { id: "Bishop's University", label: "Bishop's" },
  { id: "Université TÉLUQ", label: "TÉLUQ" },
];

const ProgramRow = memo(function ProgramRow({
  program,
  range,
  cutoffStatus,
  score,
}: {
  program: UniversityProgram;
  range: CutoffRange | null;
  cutoffStatus: CutoffStatus;
  score: number | null;
}) {
  const { t, locale } = useLocale();
  const f = useFormat();

  return (
    <div className="border-t border-ink/10 p-4 first:border-t-0 hover:bg-chalk/30 transition-colors">
      <Link
        href={`/programs/${program.id}`}
        className="flex flex-col gap-2 rounded tap-spring active:scale-[0.99]"
      >
        <div className="flex items-baseline justify-between gap-3 text-[14px]">
          <span className="font-semibold text-ink">
            {program.name} · {program.institution}
          </span>
          <span className="text-[12.5px] text-ink/55 tabular-nums">
            {range
              ? `${t("cutoff.publishedRange")} ${formatRangeYears(range)} : ${f.score(range.low)}–${f.score(range.high)}`
              : t("cutoff.unverified")}
          </span>
        </div>

        <AxisRow score={score} range={range} />

        {score !== null ? (
          <div className="flex justify-between text-[11.5px] text-ink/55 tabular-nums">
            <span>
              {t("dash.yourScore")} : {f.score(score)}
            </span>
            <span className={`font-semibold ${CUTOFF_STATUS_COLOR_CLASS[cutoffStatus]}`}>
              {t(CUTOFF_STATUS_LABEL_KEY[cutoffStatus])}
            </span>
          </div>
        ) : (
          <div className="flex justify-between text-[11.5px] text-ink/55 tabular-nums">
            <span>{program.cohortLabel}</span>
            <span className="font-semibold text-ultramarine">
              {range ? `${locale === "fr" ? "Seuil visé" : "Target"} : ${range.low.toFixed(1)}–${range.high.toFixed(1)}` : (locale === "fr" ? "Non contingenté" : "Open admission")}
            </span>
          </div>
        )}
      </Link>

      <a
        href={program.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink/40 hover:text-ink/70"
      >
        <span>{locale === "fr" ? "Source officielle" : "Official source"}</span>
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
});

export default function ProgramsPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const f = useFormat();
  const { profile } = useStudentProfile();
  const [tier, setTier] = useState<CutoffStatus | "all">("all");
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [query, setQuery] = useState("");

  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // If no cegep selected on this device, route to onboarding
  useEffect(() => {
    if (hydrated && profile.cegepId === null) router.replace("/onboarding");
  }, [hydrated, profile.cegepId, router]);

  const score = profile.rScore;

  const allRows = useMemo(() => {
    return UNIVERSITY_PROGRAMS.map((program) => {
      const range = getCutoffRange(program.cutoffHistory);
      const rowTier = score !== null ? compareToCutoffRange(score, range) : "unknown";
      return { program, range, tier: rowTier };
    }).sort((a, b) => CUTOFF_STATUS_ORDER[a.tier] - CUTOFF_STATUS_ORDER[b.tier]);
  }, [score]);

  const counts: Record<CutoffStatus, number> = useMemo(() => {
    const res: Record<CutoffStatus, number> = { above: 0, inside: 0, below: 0, unknown: 0 };
    for (const row of allRows) res[row.tier] += 1;
    return res;
  }, [allRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((row) => {
      if (tier !== "all" && row.tier !== tier) return false;
      if (selectedUniversity !== "all" && row.program.institution !== selectedUniversity && !row.program.institution.includes(selectedUniversity)) {
        return false;
      }
      if (q) {
        return row.program.name.toLowerCase().includes(q) || row.program.institution.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allRows, tier, selectedUniversity, query]);

  if (!hydrated || profile.cegepId === null) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 px-4 py-16 text-center">
          <p className="text-[14px] text-ink/60">{t("dash.noEstimate")}</p>
          <Link
            href="/onboarding"
            className="flex h-12 items-center justify-center rounded-full bg-ultramarine px-6 text-[14px] font-semibold text-paper shadow-card"
          >
            {t("dash.startOnboarding")}
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell rScore={score}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-5 px-4 py-6">
        {/* Score or Exploration Header */}
        <div className="rounded-xl border border-ink/12 bg-paper px-5 py-4 shadow-card">
          {score !== null ? (
            <div>
              <p className="text-[12px] font-medium text-ink/55">{t("plist.calcWith")}</p>
              <p className="mt-0.5 font-display text-[26px] font-extrabold text-ink tabular-nums">
                {profile.rScoreStatus !== "confirmed" && "≈ "}
                {f.score(score)}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[12px] font-medium text-ink/55">
                {locale === "fr" ? "Exploration des programmes universitaires" : "University Programs Directory"}
              </p>
              <p className="mt-0.5 font-display text-[22px] font-bold text-ink">
                {UNIVERSITY_PROGRAMS.length} {locale === "fr" ? "programmes au Québec" : "programs in Quebec"}
              </p>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("goal.searchProgram")}
            placeholder={t("goal.searchProgram")}
            autoComplete="off"
            className="h-[48px] w-full rounded-xl border border-ink/20 bg-paper pl-11 pr-4 text-[14.5px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-[1.5px] focus:border-ultramarine"
          />
        </div>

        {/* Tier Buttons if student has a score */}
        {score !== null && (
          <div className="grid grid-cols-4 gap-2">
            {TIERS.map((option) => {
              const active = tier === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTier(tier === option ? "all" : option)}
                  aria-pressed={active}
                  className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-1.5 py-2.5 text-center tap-spring transition-transform ${
                    active
                      ? "bg-ultramarine text-paper shadow-card scale-[1.02]"
                      : "border border-ink/15 bg-paper text-ink/60 hover:border-ink/30"
                  }`}
                >
                  <span className="font-display text-[18px] font-bold tabular-nums">
                    {counts[option]}
                  </span>
                  <span className="text-[10px] font-semibold leading-tight">
                    {t(CUTOFF_STATUS_LABEL_KEY[option])}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* University Filter Chips */}
        <div className="flex flex-wrap gap-1.5">
          {UNIVERSITIES_FILTER.map((uni) => {
            const isSelected = selectedUniversity === uni.id;
            return (
              <button
                key={uni.id}
                type="button"
                onClick={() => setSelectedUniversity(uni.id)}
                className={`rounded-full px-3 py-1 text-[11.5px] font-semibold transition-all ${
                  isSelected
                    ? "bg-ultramarine text-paper shadow-sm"
                    : "border border-ink/15 bg-paper text-ink/70 hover:bg-chalk"
                }`}
              >
                {uni.label}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div className="overflow-hidden rounded-xl border border-ink/12 bg-paper shadow-card">
          <div className="border-b border-ink/8 px-4 py-2.5 bg-chalk/30 text-[12px] font-bold uppercase tracking-wider text-ink/55 flex justify-between items-center">
            <span>{locale === "fr" ? "Programmes trouvés" : "Programs found"}</span>
            <span className="tabular-nums font-semibold">{filtered.length}</span>
          </div>

          {filtered.length === 0 && (
            <p className="p-8 text-center text-[13.5px] text-ink/50">{t("plist.empty")}</p>
          )}
          {filtered.map(({ program, range, tier: rowTier }) => (
            <ProgramRow
              key={program.id}
              program={program}
              range={range}
              cutoffStatus={rowTier}
              score={score}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
