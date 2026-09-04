"use client";

import { useEffect, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { SourceStamp } from "@/components/SourceStamp";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Bursary } from "@/lib/sample-data";
import { useReferenceCatalog } from "@/lib/data/reference-store";
import { resolveCegepName } from "@/lib/data/resolve-names";
import { matchBursaries, type BursaryMatch, type MatchReason, type MatchTier } from "@/lib/matching/match";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { markBursariesSeen } from "@/lib/notifications/inbox";
import { useStudentProfile } from "@/lib/profile/store";
import { tagLabel } from "@/lib/tags/taxonomy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const TIERS: { id: MatchTier; title: TranslationKey; sub: TranslationKey; accent: string }[] = [
  { id: "matched", title: "burs.matched", sub: "burs.matchedSub", accent: "text-moss" },
  { id: "close", title: "burs.close", sub: "burs.closeSub", accent: "text-ember" },
  { id: "explore", title: "burs.explore", sub: "burs.exploreSub", accent: "text-ink/55" },
];

export default function BursariesPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const f = useFormat();
  const { profile, sync } = useStudentProfile();
  const hydrated = useHydrated();
  const { bursaries } = useReferenceCatalog();

  // The hydration pass renders the server snapshot (an empty profile), and a signed-in
  // student's first reconcile may still be pulling a newer copy. Matching against either
  // paints one set of tiers and reshuffles them a frame later, so nothing below decides
  // until both have settled.
  const ready = hydrated && sync !== "syncing";

  // No cégep means onboarding was never finished on this device — nothing real to show.
  useEffect(() => {
    if (ready && profile.cegepId === null) router.replace("/onboarding");
  }, [ready, profile.cegepId, router]);

  // Every hook sits ABOVE the early return below: `ready` flips between renders, and a hook
  // placed after the guard would be skipped once and then called — "Rendered more hooks than
  // during the previous render".
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

  // Local arithmetic over a small dataset with referentially stable memoization. Null until
  // the profile is trustworthy, so no tier is ever computed from the transient snapshot.
  const matches = useMemo(
    () => (ready ? matchBursaries(bursaries, studentContext) : null),
    [ready, studentContext, bursaries],
  );

  // Opening the bursaries page marks the matched-tier bursaries as seen, so the inbox stops
  // announcing them as new. An effect, after render — never during.
  useEffect(() => {
    if (matches) markBursariesSeen(matches.matched.map((m) => m.bursary.id));
  }, [matches]);

  // Null when unknown or unset: the line is omitted rather than filled with a placeholder.
  const cegepName = resolveCegepName(profile.cegepId);

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
        return t("burs.rTag").replace("{tag}", reason.tagId ? tagLabel(reason.tagId, locale) : "");
      case "session":
        return t("burs.rSession").replace("{n}", String(reason.session ?? ""));
      case "rscore_gap": {
        // The minimum the gap is measured against, so the chip is a checkable figure.
        const min = profile.rScore !== null && reason.gap !== undefined ? profile.rScore + reason.gap : null;
        return t("burs.rGap")
          .replace("{gap}", f.score(reason.gap ?? 0))
          .replace("{min}", min === null ? "—" : f.score(min));
      }
    }
  }

  const shellProps = {
    rScore: profile.rScore,
    rScoreStatus: profile.rScoreStatus,
    currentSession: profile.currentSession,
  };

  // Also covers the frame between "no cégep" being known and the redirect landing.
  if (matches === null || profile.cegepId === null) {
    return (
      <AppShell {...shellProps}>
        <BursariesSkeleton label={t("common.loading")} />
      </AppShell>
    );
  }

  return (
    <AppShell {...shellProps}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-4 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[27px] font-bold leading-tight tracking-tight text-ink">
            {t("burs.title")}
          </h1>
          {cegepName && <p className="text-[13px] text-ink/55">{cegepName}</p>}
        </div>

        {/* A first-session student has no cote R: say so here, and say what is already
            matchable, instead of letting the empty "matched" tier speak for itself. */}
        {profile.rScore === null && (
          <div className="flex flex-col gap-3 rounded-xl border border-ink/12 bg-paper p-3.5">
            <p className="text-[12.5px] leading-relaxed text-ink/65">{t("burs.firstSessionNote")}</p>
            {/* The one thing a first-session student can act on is the list right below. */}
            <a
              href="#burs-matched"
              className="inline-flex min-h-[44px] w-fit items-center rounded-full border border-ink/15 px-4 text-[12.5px] font-semibold text-ultramarine tap-spring hover:bg-chalk"
            >
              {t("burs.seeOpenNow").replace("{n}", String(matches.matched.length))}
            </a>
          </div>
        )}

        {TIERS.map(({ id, title, sub, accent }) => {
          const items = matches[id];
          return (
            <section key={id} id={`burs-${id}`} className="flex flex-col gap-3 scroll-mt-16">
              <div className="flex flex-col gap-0.5">
                <h2 className={`font-display text-[17px] font-bold ${accent}`}>
                  {t(title)}{" "}
                  <span className="text-[13px] font-semibold tabular-nums text-ink/45">· {items.length}</span>
                </h2>
                <p className="text-[12px] leading-relaxed text-ink/55">{t(sub)}</p>
              </div>

              {items.length === 0 ? (
                id === "matched" ? (
                  <EmptyState
                    compact
                    title={t("burs.emptyMatchedTitle")}
                    body={t("burs.emptyMatched")}
                    action={{ href: "/profile", label: t("burs.editTags") }}
                  />
                ) : (
                  <EmptyState compact title={t("burs.emptyTier")} />
                )
              ) : (
                items.map((match) => (
                  <BursaryCard
                    key={match.bursary.id}
                    match={match}
                    reasonText={reasonText}
                    amountLabel={amountLabel(match.bursary, f.amount)}
                    deadlineLabel={
                      match.bursary.deadlineIso
                        ? t("burs.deadline").replace(
                            "{date}",
                            f.date(
                              match.bursary.deadlineIso,
                              match.bursary.deadlinePrecision === "month" ? "month" : "day",
                            ),
                          )
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

/**
 * Geometry-matched placeholder: the title, the cégep line, and three card blocks at the
 * heights the real tiers use, so the swap to content moves nothing. No spinner, on purpose.
 */
function BursariesSkeleton({ label }: { label: string }) {
  const block = "animate-pulse motion-reduce:animate-none";
  return (
    <div
      className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-4 py-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>
      <div className="flex flex-col gap-2">
        <div className={`h-8 w-32 rounded bg-ink/8 ${block}`} />
        <div className={`h-4 w-44 rounded bg-ink/8 ${block}`} />
      </div>
      <div className={`h-44 rounded border border-ink/8 bg-paper ${block}`} />
      <div className={`h-44 rounded border border-ink/8 bg-paper ${block}`} />
      <div className={`h-44 rounded border border-ink/8 bg-paper ${block}`} />
    </div>
  );
}

function amountLabel(bursary: Bursary, amount: (v: number) => string): string | null {
  if (bursary.amountMin === null && bursary.amountMax === null) return null;
  const min = bursary.amountMin ?? bursary.amountMax;
  const max = bursary.amountMax ?? bursary.amountMin;
  if (min === null || max === null) return null;
  return min === max ? amount(min) : `${amount(min)} – ${amount(max)}`;
}

const BursaryCard = memo(function BursaryCard({
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
    <article className="flex flex-col gap-3 rounded border border-ink/12 bg-paper p-4 shadow-card [content-visibility:auto] [contain-intrinsic-size:0_180px]">
      {/* The name leads and gets the full width; the amount follows it instead of shouting
          from a half-width column beside a five-line title. */}
      <h3 className="text-[14.5px] font-semibold leading-snug text-ink">{bursary.name}</h3>
      <p className="flex flex-wrap items-baseline gap-x-2 text-[12px] text-ink/55">
        <span>{bursary.sourceOrg}</span>
        {amountLabel && (
          <span className="font-display text-[15px] font-bold text-ultramarine tabular-nums">
            {amountLabel}
          </span>
        )}
      </p>

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
            className="inline-flex min-h-[48px] items-center gap-1 rounded-full border border-ultramarine/30 px-4 text-[13px] font-semibold text-ultramarine tap-spring hover:bg-ultramarine/[0.06] active:scale-[0.98]"
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

      {/* Guardrail #1: the amount and the deadline above share this one stamp. */}
      <SourceStamp date={bursary.lastVerifiedAt} href={bursary.sourceUrl} />
    </article>
  );
});
