"use client";

import { BookOpen, Compass, Briefcase, ShieldCheck } from "lucide-react";
import { SourceStamp } from "@/components/SourceStamp";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getGenericProgramProfile } from "@/lib/data/generic-program-profiles";

export function DecProgramProfileCard({
  programCode,
  cegepShortCode,
}: {
  programCode: string;
  cegepShortCode?: string | null;
}) {
  const { t, locale } = useLocale();
  const profile = getGenericProgramProfile(programCode);

  if (!profile) return null;

  // The profile data ships both languages side by side (name/nameEn, labelFr/labelEn); this
  // is the one place the card picks between them. UI copy goes through the dictionary.
  const pick = (fr: string, en: string) => (locale === "fr" ? fr : en);

  const relevantProfils = cegepShortCode
    ? profile.profils.filter(
        (p) =>
          p.offeredAtCegeps.length === 0 ||
          p.offeredAtCegeps.includes(cegepShortCode),
      )
    : profile.profils;

  const profilsToDisplay =
    relevantProfils.length > 0 ? relevantProfils : profile.profils;

  return (
    <section className="flex flex-col gap-4 rounded border border-ink/12 bg-paper p-4 shadow-card">
      <div className="flex items-start justify-between gap-3 border-b border-ink/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen aria-hidden="true" className="h-4 w-4 text-ultramarine" />
            <h2 className="font-display text-[16px] font-bold text-ink">
              {pick(profile.name, profile.nameEn)}
            </h2>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink/70">
            {pick(profile.description, profile.descriptionEn)}
          </p>
        </div>
      </div>

      {/* Profils offerts */}
      <div className="flex flex-col gap-2.5">
        <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink/50">
          <Compass aria-hidden="true" className="h-3.5 w-3.5" />
          {t("decProfile.commonProfiles")}
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {profilsToDisplay.map((p) => (
            <div
              key={p.name}
              className="rounded border border-ink/10 bg-chalk/40 p-3"
            >
              <p className="text-[13.5px] font-semibold text-ink">
                {pick(p.name, p.nameEn)}
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink/60">
                {pick(p.description, p.descriptionEn)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Domaines universitaires visés */}
      <div className="flex flex-col gap-2 border-t border-ink/10 pt-3">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink/50">
          {t("decProfile.relatedFields")}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {profile.leadsToProgramCategories.map((cat) => (
            <span
              key={cat.id}
              className="rounded-full border border-ink/15 bg-paper px-2.5 py-1 text-[11.5px] font-medium text-ink/75"
            >
              {pick(cat.labelFr, cat.labelEn)}
            </span>
          ))}
        </div>
      </div>

      {/* Exemples de professions documentées (factuel, sourcé) */}
      <div className="flex flex-col gap-2 border-t border-ink/10 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink/50">
            <Briefcase aria-hidden="true" className="h-3.5 w-3.5" />
            {t("decProfile.careerExamples")}
          </h3>
          <span className="flex items-center gap-1 text-[10.5px] text-ink/40">
            <ShieldCheck aria-hidden="true" className="h-3 w-3" />
            {t("decProfile.factualData")}
          </span>
        </div>
        <p className="text-[11.5px] leading-snug text-ink/55">
          {t("decProfile.careerDisclaimer")}
        </p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {profile.factualCareerExamples.map((ex) => (
            <div
              key={ex.titleFr}
              className="flex items-baseline justify-between gap-2 border-b border-ink/5 py-1 text-[12.5px] last:border-b-0"
            >
              <span className="font-semibold text-ink">
                {pick(ex.titleFr, ex.titleEn)}
              </span>
              <span className="text-[11px] text-ink/50">
                {pick(ex.fieldFr, ex.fieldEn)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Source and verification date: the same stamp as every other figure in the app. */}
      <SourceStamp
        date={profile.lastVerifiedAt}
        href={profile.sourceUrl}
        label={t("decProfile.officialPage")}
        className="border-t border-ink/10 pt-3"
      />
    </section>
  );
}
