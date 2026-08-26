"use client";

import { useState } from "react";
import {
  ChevronDown,
  BookOpen,
  Compass,
  Briefcase,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { SourceStamp } from "@/components/SourceStamp";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useStudentProfile } from "@/lib/profile/store";
import type { GenericProgramProfile } from "@/lib/data/generic-program-profiles";

export function GenericProgramProfileCard({
  profile,
  initialExpanded = true,
  cegepId: propCegepId,
}: {
  profile: GenericProgramProfile;
  initialExpanded?: boolean;
  cegepId?: string | null;
}) {
  const { locale } = useLocale();
  const { profile: studentProfile } = useStudentProfile();
  const activeCegepId = propCegepId ?? studentProfile?.cegepId;

  const [expanded, setExpanded] = useState(initialExpanded);
  const [selectedProfilIndex, setSelectedProfilIndex] = useState(0);

  const title = locale === "fr" ? profile.name : profile.nameEn;
  const description = locale === "fr" ? profile.description : profile.descriptionEn;
  const currentProfil = profile.profils[selectedProfilIndex] ?? profile.profils[0];
  const offerings = currentProfil?.cegepOfferingsList ?? [];
  const specificCourses = currentProfil?.specificCourses ?? [];

  // Match the student's specific CEGEP offering if available
  const studentCegepOffering = activeCegepId
    ? offerings.find((o) => o.cegepShortCode === activeCegepId)
    : undefined;

  return (
    <section className="flex flex-col overflow-hidden rounded border border-ink/12 bg-paper shadow-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-ink/10 bg-chalk/40 p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-ultramarine/10 px-2.5 py-0.5 text-[11px] font-bold text-ultramarine">
              DEC {profile.programCode}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/50">
              {locale === "fr" ? "Programme collégial québécois" : "Quebec Collegial Program"}
            </span>
          </div>
          <h2 className="mt-1 font-display text-[20px] font-bold leading-tight text-ink">
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="-mr-1 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-ink/40 transition-colors hover:text-ink active:bg-ink/10"
          aria-label={expanded ? "Réduire" : "Développer"}
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ease-arrival ${expanded ? "rotate-180" : "rotate-0"}`} />
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-5 p-4">
          <p className="text-[13.5px] leading-relaxed text-ink/80">{description}</p>

          {/* Internal Profils Tabs & Specific Profile Courses */}
          {profile.profils.length > 0 && (
            <div className="flex flex-col gap-3 rounded border border-ink/10 bg-chalk/20 p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-ink/60">
                  <Compass className="h-3.5 w-3.5 text-ultramarine" />
                  <span>
                    {locale === "fr"
                      ? "Profils réels par établissement"
                      : "Real Profiles by Institution"}
                  </span>
                </div>
              </div>

              {/* Profile Selector Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {profile.profils.map((p, idx) => {
                  const active = idx === selectedProfilIndex;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProfilIndex(idx)}
                      className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors active:scale-[0.98] ${
                        active
                          ? "bg-ultramarine text-paper shadow-card"
                          : "border border-ink/15 bg-paper text-ink/75 hover:border-ink/30"
                      }`}
                    >
                      {locale === "fr" ? p.name : p.nameEn}
                    </button>
                  );
                })}
              </div>

              {/* Selected Profile Detail Box */}
              {currentProfil && (
                <div className="mt-1 flex flex-col gap-3 border-t border-ink/10 pt-2.5">
                  <p className="text-[12.5px] leading-relaxed text-ink/75">
                    {locale === "fr" ? currentProfil.description : currentProfil.descriptionEn}
                  </p>

                  {/* Student's Specific CEGEP Highlight Card */}
                  {studentCegepOffering && (
                    <div className="rounded border border-ultramarine/30 bg-ultramarine/[0.04] p-3 text-[12.5px]">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ultramarine">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>
                          {locale === "fr"
                            ? `À ton cégep (${studentCegepOffering.cegepName}) :`
                            : `At your cégep (${studentCegepOffering.cegepName}):`}
                        </span>
                      </div>
                      <div className="mt-1 font-bold text-ink">
                        {locale === "fr"
                          ? studentCegepOffering.profilNameFr
                          : studentCegepOffering.profilNameEn}
                      </div>
                      <p className="mt-0.5 text-[12px] text-ink/75">
                        {locale === "fr"
                          ? studentCegepOffering.descriptionFr
                          : studentCegepOffering.descriptionEn}
                      </p>
                      {studentCegepOffering.specialFeaturesFr && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(locale === "fr"
                            ? studentCegepOffering.specialFeaturesFr
                            : studentCegepOffering.specialFeaturesEn ?? []
                          ).map((feat) => (
                            <span
                              key={feat}
                              className="rounded bg-ultramarine/10 px-2 py-0.5 text-[11px] font-medium text-ultramarine"
                            >
                              ★ {feat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Specific Courses for this profile */}
                  {specificCourses.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-ink/55">
                        {locale === "fr"
                          ? `Cours propres au profil « ${currentProfil.name} » :`
                          : `Courses specific to « ${currentProfil.nameEn} »:`}
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {specificCourses.map((c) => (
                          <div
                            key={c.code}
                            className="flex flex-col gap-0.5 rounded border border-ink/10 bg-paper p-2.5 text-[12px]"
                          >
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="font-semibold text-ink">
                                {locale === "fr" ? c.nameFr : c.nameEn}
                              </span>
                              <span className="rounded bg-ink/[0.05] px-1.5 py-0.5 text-[10.5px] font-bold tabular-nums text-ink/60">
                                {c.code}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-ink/50">
                              {c.ponderation && (
                                <span className="tabular-nums">
                                  {locale === "fr" ? "Pondération :" : "Weighting:"} {c.ponderation}
                                </span>
                              )}
                              {c.prerequisiteFor && (
                                <span className="font-medium text-ultramarine">
                                  ★ {c.prerequisiteFor}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All CEGEP Offerings for this profile */}
                  {offerings.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-ink/50">
                        {locale === "fr"
                          ? "Dénominations exactes par cégep :"
                          : "Exact Profile Names across Cégeps:"}
                      </span>
                      <div className="flex flex-col gap-1">
                        {offerings.map((offering) => {
                          const isStudentCegep = offering.cegepShortCode === activeCegepId;
                          return (
                            <div
                              key={offering.cegepShortCode}
                              className={`flex flex-col gap-0.5 rounded border px-3 py-2 text-[11.5px] ${
                                isStudentCegep
                                  ? "border-ultramarine/30 bg-ultramarine/[0.03]"
                                  : "border-ink/8 bg-paper"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-ink">
                                  {offering.cegepName}
                                </span>
                                {isStudentCegep && (
                                  <span className="rounded-full bg-ultramarine px-1.5 py-0.2 text-[9.5px] font-bold text-paper">
                                    {locale === "fr" ? "Ton cégep" : "Your cégep"}
                                  </span>
                                )}
                              </div>
                              <span className="font-medium text-ink/80">
                                {locale === "fr" ? offering.profilNameFr : offering.profilNameEn}
                              </span>
                              {offering.specialFeaturesFr && offering.specialFeaturesFr.length > 0 && (
                                <span className="text-[10.5px] text-ink/50">
                                  {(locale === "fr"
                                    ? offering.specialFeaturesFr
                                    : offering.specialFeaturesEn ?? []
                                  ).join(" · ")}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tronc commun / Core Courses */}
          {profile.typicalCourses.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-ink/60">
                <BookOpen className="h-3.5 w-3.5 text-moss" />
                <span>
                  {locale === "fr"
                    ? "Tronc commun obligatoire du DEC"
                    : "Compulsory Core Curriculum"}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {profile.typicalCourses.map((c) => (
                  <div
                    key={c.code}
                    className="flex flex-col gap-0.5 rounded border border-ink/8 bg-paper p-2 text-[12px]"
                  >
                    <div className="flex items-baseline justify-between gap-1.5">
                      <span className="font-medium text-ink/85">
                        {locale === "fr" ? c.nameFr : c.nameEn}
                      </span>
                      <span className="text-[10.5px] font-bold tabular-nums text-ink/40">
                        {c.code}
                      </span>
                    </div>
                    {c.ponderation && (
                      <span className="text-[10px] text-ink/45 tabular-nums">
                        {locale === "fr" ? "Pondération" : "Weighting"} {c.ponderation}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Destination Categories */}
          {profile.leadsToProgramCategories.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-ink/60">
                <GraduationCap className="h-3.5 w-3.5 text-ultramarine" />
                <span>
                  {locale === "fr"
                    ? "Principaux débouchés universitaires"
                    : "Main University Destination Fields"}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {profile.leadsToProgramCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="rounded border border-ink/10 bg-chalk/20 px-3 py-2 text-[12px] text-ink/80"
                  >
                    <span className="font-semibold text-ink">
                      {locale === "fr" ? cat.labelFr : cat.labelEn}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sourced Career Examples */}
          {profile.factualCareerExamples.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-ink/60">
                <Briefcase className="h-3.5 w-3.5 text-ember" />
                <span>
                  {locale === "fr"
                    ? "Exemples de cheminements observés chez les diplômés"
                    : "Examples of Observed Graduate Career Paths"}
                </span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-ink/55">
                {locale === "fr"
                  ? "Exemples documentés dans les publications des cégeps et universités (non limitatif)."
                  : "Examples documented in collegial and university publications (non-exhaustive)."}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profile.factualCareerExamples.map((career) => {
                  const label = locale === "fr" ? career.titleFr : career.titleEn;
                  const field = locale === "fr" ? career.fieldFr : career.fieldEn;
                  return (
                    <span
                      key={career.titleFr}
                      className="inline-flex items-center gap-1 rounded-full border border-ink/12 bg-paper px-3 py-1 text-[12px] font-medium text-ink/80 shadow-xs"
                    >
                      <span>{label}</span>
                      {field && <span className="text-[10.5px] text-ink/45">({field})</span>}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Provenance Stamp */}
          <SourceStamp
            date={profile.lastVerifiedAt}
            href={profile.sourceUrl}
            className="border-t border-ink/10 pt-2"
          />
        </div>
      )}
    </section>
  );
}
