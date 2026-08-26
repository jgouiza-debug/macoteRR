"use client";

import { BookOpen, Compass, Briefcase, ExternalLink, ShieldCheck } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getGenericProgramProfile } from "@/lib/data/generic-program-profiles";

export function DecProgramProfileCard({
  programCode,
  cegepShortCode,
}: {
  programCode: string;
  cegepShortCode?: string | null;
}) {
  const { locale } = useLocale();
  const profile = getGenericProgramProfile(programCode);

  if (!profile) return null;

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
            <BookOpen className="h-4 w-4 text-ultramarine" />
            <h2 className="font-display text-[16px] font-bold text-ink">
              {locale === "fr" ? profile.name : profile.nameEn}
            </h2>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink/70">
            {locale === "fr" ? profile.description : profile.descriptionEn}
          </p>
        </div>
      </div>

      {/* Profils offerts */}
      <div className="flex flex-col gap-2.5">
        <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink/50">
          <Compass className="h-3.5 w-3.5" />
          {locale === "fr" ? "Profils courants" : "Common profiles"}
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {profilsToDisplay.map((p) => (
            <div
              key={p.name}
              className="rounded border border-ink/10 bg-chalk/40 p-3"
            >
              <p className="text-[13.5px] font-semibold text-ink">
                {locale === "fr" ? p.name : p.nameEn}
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink/60">
                {locale === "fr" ? p.description : p.descriptionEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Domaines universitaires visés */}
      <div className="flex flex-col gap-2 border-t border-ink/10 pt-3">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-ink/50">
          {locale === "fr"
            ? "Domaines universitaires connexes"
            : "Related university fields"}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {profile.leadsToProgramCategories.map((cat) => (
            <span
              key={cat.id}
              className="rounded-full border border-ink/15 bg-paper px-2.5 py-1 text-[11.5px] font-medium text-ink/75"
            >
              {locale === "fr" ? cat.labelFr : cat.labelEn}
            </span>
          ))}
        </div>
      </div>

      {/* Exemples de professions documentées (factuel, sourcé) */}
      <div className="flex flex-col gap-2 border-t border-ink/10 pt-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink/50">
            <Briefcase className="h-3.5 w-3.5" />
            {locale === "fr"
              ? "Exemples de carrières des diplômés"
              : "Graduate career examples"}
          </h3>
          <span className="flex items-center gap-1 text-[10.5px] text-ink/40">
            <ShieldCheck className="h-3 w-3" />
            {locale === "fr" ? "Données factuelles" : "Factual data"}
          </span>
        </div>
        <p className="text-[11.5px] leading-snug text-ink/55">
          {locale === "fr"
            ? "Tiré des répertoires de programmes des cégeps. Ne constitue pas un conseil d'orientation personnalisé."
            : "From official CEGEP program directories. Not personalized career counselling."}
        </p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {profile.factualCareerExamples.map((ex) => (
            <div
              key={ex.titleFr}
              className="flex items-baseline justify-between gap-2 border-b border-ink/5 py-1 text-[12.5px] last:border-b-0"
            >
              <span className="font-semibold text-ink">
                {locale === "fr" ? ex.titleFr : ex.titleEn}
              </span>
              <span className="text-[11px] text-ink/50">
                {locale === "fr" ? ex.fieldFr : ex.fieldEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Source et date de vérification */}
      <div className="flex items-center justify-between border-t border-ink/10 pt-3 text-[11px] text-ink/50">
        <span>
          {locale === "fr" ? "Vérifié le" : "Verified on"}{" "}
          {profile.lastVerifiedAt}
        </span>
        <a
          href={profile.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 font-semibold text-ultramarine underline underline-offset-2"
        >
          {locale === "fr" ? "Fiche officielle du cégep" : "Official cégep page"}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}
