"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell/AppShell";
import { BURSARIES, SESSIONS } from "@/lib/sample-data";
import { findCegep, findCegepProgram } from "@/lib/data/catalog";
import { resolveTargets } from "@/lib/data/targets";
import { useStudentProfile } from "@/lib/profile/store";
import { SELF_TAGS, tagLabel } from "@/lib/tags/taxonomy";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function ProfilePage() {
  const { t, locale } = useLocale();
  const { profile, toggleTag, toggleTarget } = useStudentProfile();
  const targets = resolveTargets(profile.targetUniversityProgramIds);

  const fields = [
    {
      label: t("prof.cegep"),
      value: findCegep(profile.cegepId)?.name ?? "—",
    },
    {
      label: t("prof.program"),
      value: findCegepProgram(profile.cegepProgramId)?.name ?? "—",
    },
    {
      label: t("prof.session"),
      value:
        SESSIONS.find((s) => s.id === profile.currentSession)?.[
          locale === "fr" ? "labelFr" : "labelEn"
        ] ?? "—",
    },
  ];

  return (
    <AppShell rScore={profile.rScore ?? undefined}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-4 py-6">
        <h1 className="font-display text-[27px] font-bold leading-tight tracking-tight text-ink">
          {t("prof.title")}
        </h1>

        <div className="overflow-hidden rounded border border-ink/12 bg-paper shadow-card">
          {fields.map((field) => (
            <div
              key={field.label}
              className="flex items-center justify-between gap-4 border-b border-ink/10 px-4 py-3.5 last:border-b-0"
            >
              <span className="text-[12px] font-semibold text-ink/50">{field.label}</span>
              <span className="text-right text-[14px] font-semibold text-ink">{field.value}</span>
            </div>
          ))}
        </div>

        <section className="flex flex-col gap-3 rounded border border-ink/12 bg-paper p-4 shadow-card">
          <h2 className="font-display text-[17px] font-bold text-ink">{t("prof.targetsTitle")}</h2>
          <p className="-mt-1 text-[12.5px] leading-relaxed text-ink/60">{t("prof.targetsHelp")}</p>

          {targets.length === 0 ? (
            <div className="flex flex-col items-start gap-2 pt-1">
              <p className="text-[13px] text-ink/50">{t("prof.targetsEmpty")}</p>
              <Link href="/programs" className="text-[14px] font-semibold text-ultramarine">
                {t("prof.targetsAdd")}
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {targets.map((target) => (
                <li
                  key={target.id}
                  className="flex items-start justify-between gap-3 rounded border border-ink/12 px-3.5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    {target.hasDetailPage ? (
                      <Link
                        href={`/programs/${target.id}`}
                        className="wrap-fr block text-[13.5px] font-semibold leading-snug text-ink underline-offset-2 hover:underline"
                      >
                        {target.name}
                      </Link>
                    ) : (
                      <span className="wrap-fr block text-[13.5px] font-semibold leading-snug text-ink">
                        {target.name}
                      </span>
                    )}
                    <span className="mt-0.5 block text-[11.5px] text-ink/50">
                      {target.institution}
                      {target.cutoff !== null
                        ? ` · ${t("common.seuil")} ${target.cutoff}`
                        : ` · ${t("prof.noCutoff")}`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleTarget(target.id)}
                    aria-label={`${t("prof.remove")} — ${target.name}`}
                    className="flex h-8 flex-shrink-0 items-center rounded-full px-3 text-[12px] font-semibold text-ink/50 transition-colors active:bg-ink/8"
                  >
                    {t("prof.remove")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded border border-ink/12 bg-paper p-4 shadow-card">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[17px] font-bold text-ink">{t("prof.tagsTitle")}</h2>
            <span className="text-[11.5px] text-ink/50 tabular-nums">
              {t("prof.tagsCount").replace("{n}", String(profile.selfTags.length))}
            </span>
          </div>

          <p className="text-[12.5px] leading-relaxed text-ink/60">{t("prof.tagsHelp")}</p>

          <ul className="flex flex-wrap gap-2">
            {SELF_TAGS.map((tag) => {
              const selected = profile.selfTags.includes(tag.id);
              // How many bursaries actually reference this tag. Per docs/03, a tag never
              // gates eligibility — it explains a match — so this counts real usage rather
              // than claiming the tag "unlocks" anything.
              const usedBy = BURSARIES.filter((b) => b.tagCriteria?.includes(tag.id)).length;

              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleTag(tag.id)}
                    className={`flex min-h-[48px] items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-colors active:scale-[0.98] ${
                      selected
                        ? "border-ultramarine bg-ultramarine text-paper"
                        : "border-ink/20 bg-paper text-ink/70"
                    }`}
                  >
                    {tagLabel(tag.id, locale)}
                    {usedBy > 0 && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums ${
                          selected ? "bg-paper/25 text-paper" : "bg-ink/8 text-ink/55"
                        }`}
                      >
                        {usedBy}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="border-t border-ink/10 pt-3 text-[11.5px] leading-relaxed text-ink/50">
            {t("prof.tagsNoFinance")}
          </p>
        </section>

        <Link
          href="/counselor-prep"
          className="flex h-14 w-full items-center justify-center rounded-full border border-ink/25 bg-paper text-[15px] font-semibold text-ink transition-transform active:scale-[0.98]"
        >
          {locale === "fr" ? "Préparer ma rencontre" : "Prepare my meeting"}
        </Link>
      </div>
    </AppShell>
  );
}

