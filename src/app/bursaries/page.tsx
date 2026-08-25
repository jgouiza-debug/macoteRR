"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { SourceStamp } from "@/components/SourceStamp";
import { BURSARIES, type Bursary } from "@/lib/sample-data";
import { CEGEPS } from "@/lib/sample-data";
import { matchBursaries, type BursaryMatch, type MatchReason, type MatchTier } from "@/lib/matching/match";
import { useStudentProfile } from "@/lib/profile/store";
import { tagLabel } from "@/lib/tags/taxonomy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const TIERS: { id: MatchTier; title: TranslationKey; accent: string }[] = [
  { id: "matched", title: "burs.matched", accent: "text-moss" },
  { id: "close", title: "burs.close", accent: "text-ember" },
  { id: "explore", title: "burs.explore", accent: "text-ink/55" },
];

export default function BursariesPage() {
  const { t, locale } = useLocale();
  const f = useFormat();
  const { profile } = useStudentProfile();

  // Local arithmetic over a small dataset with referentially stable memoization.
  const studentContext = useMemo(
    () => ({
      cegepId: profile.cegepId,
      cegepProgramId: profile.cegepProgramId,
      currentSession: profile.currentSession,
      rScore: profile.rScore,
      selfTags: profile.selfTags,
      targetUniversityProgramIds: profile.targetUniversityProgramIds,
    }),
    [
      profile.cegepId,
      profile.cegepProgramId,
      profile.currentSession,
      profile.rScore,
      profile.selfTags,
      profile.targetUniversityProgramIds,
    ],
  );

  const matches = useMemo(() => matchBursaries(BURSARIES, studentContext), [studentContext]);

  const cegepName =
    CEGEPS.find((c) => c.id === profile.cegepId)?.name ?? t("prof.cegep");

  function reasonText(reason: MatchReason): string {
    switch (reason.kind) {
      case "cegep":
        return t("burs.rCegep");
      case "program":
        return t("burs.rProgram");
      case "rscore":
        return t("burs.rScore");
      case "target":
        return t("burs.rTarget");
      case "open":
        return t("burs.rOpen");
      case "tag":
        return `${t("burs.rTagged")} : ${reason.tagId ? tagLabel(reason.tagId, locale) : ""}`;
      case "rscore_gap":
        return t("burs.rGap").replace("{gap}", f.score(reason.gap ?? 0));
    }
  }

  return (
    <AppShell rScore={profile.rScore ?? undefined}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-4 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[27px] font-bold leading-tight tracking-tight text-ink">
            {t("burs.title")}
          </h1>
          <p className="text-[13px] text-ink/55">{cegepName}</p>
        </div>

        {TIERS.map(({ id, title, accent }) => {
          const items = matches[id];
          return (
            <section key={id} className="flex flex-col gap-3">
              <h2 className={`font-display text-[17px] font-bold ${accent}`}>{t(title)}</h2>

              {items.length === 0 ? (
                <div className="rounded border border-dashed border-ink/20 p-4">
                  <p className="text-[12.5px] leading-relaxed text-ink/55">
                    {id === "matched" ? t("burs.emptyMatched") : t("burs.emptyTier")}
                  </p>
                  {id === "matched" && (
                    <Link
                      href="/profile"
                      className="mt-2 inline-block text-[13px] font-semibold text-ultramarine"
                    >
                      {t("burs.editTags")}
                    </Link>
                  )}
                </div>
              ) : (
                items.map((match) => (
                  <BursaryCard
                    key={match.bursary.id}
                    match={match}
                    reasonText={reasonText}
                    amountLabel={amountLabel(match.bursary, f.amount)}
                    deadlineLabel={
                      match.bursary.deadlineIso
                        ? f.date(match.bursary.deadlineIso, match.bursary.deadlinePrecision ?? "day")
                        : t("burs.noDeadline")
                    }
                    t={t}
                  />
                ))
              )}
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}

function amountLabel(bursary: Bursary, amount: (v: number) => string): string | null {
  if (bursary.amountMin === null && bursary.amountMax === null) return null;
  const min = bursary.amountMin ?? bursary.amountMax;
  const max = bursary.amountMax ?? bursary.amountMin;
  if (min === null || max === null) return null;
  return min === max ? amount(min) : `${amount(min)} – ${amount(max)}`;
}

function BursaryCard({
  match,
  reasonText,
  amountLabel,
  deadlineLabel,
  t,
}: {
  match: BursaryMatch<Bursary>;
  reasonText: (r: MatchReason) => string;
  amountLabel: string | null;
  deadlineLabel: string;
  t: (key: TranslationKey) => string;
}) {
  const { bursary, reasons } = match;
  const requirements = [
    bursary.requiresEssay ? t("burs.essay") : null,
    bursary.requiresRecommendation ? t("burs.reco") : null,
  ].filter(Boolean) as string[];

  return (
    <article className="flex flex-col gap-3 rounded border border-ink/12 bg-paper p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="flex-1 text-[14px] font-semibold leading-snug text-ink">{bursary.name}</h3>
        {amountLabel && (
          <span className="font-display text-[18px] font-bold text-ultramarine tabular-nums">
            {amountLabel}
          </span>
        )}
      </div>

      <p className="text-[12px] text-ink/55">{bursary.sourceOrg}</p>

      {reasons.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {reasons.map((reason, i) => (
            <li
              key={`${reason.kind}-${reason.tagId ?? i}`}
              className="rounded-full bg-chalk px-2.5 py-1 text-[11px] font-semibold text-ink/75"
            >
              {reasonText(reason)}
            </li>
          ))}
        </ul>
      )}

      {requirements.length > 0 && (
        <p className="text-[11.5px] text-ink/50">{requirements.join(" · ")}</p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-3">
        <span className="text-[11.5px] font-semibold text-ink/55">{deadlineLabel}</span>

        {bursary.hasPublicApplicationLink && bursary.applicationUrl ? (
          <a
            href={bursary.applicationUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-ultramarine"
          >
            {t("burs.apply")}
            {/* Kept deliberately: warns the student they are leaving the app. */}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>

      {/* No public form exists — route the student to a real human instead of a dead link. */}
      {!bursary.hasPublicApplicationLink && (
        <p className="rounded bg-ink/[0.04] px-3 py-2.5 text-[12px] leading-relaxed text-ink/65">
          {t("burs.noLink")}
        </p>
      )}

      <SourceStamp date={bursary.lastVerifiedAt} href={bursary.sourceUrl} />
    </article>
  );
}
