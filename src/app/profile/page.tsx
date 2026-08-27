"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, LogOut, GraduationCap, Edit3 } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { BURSARIES, CEGEPS, CEGEP_PROGRAMS, SESSIONS, UNIVERSITY_PROGRAMS } from "@/lib/sample-data";
import { CEGEP_DEC_PROGRAMS } from "@/lib/data/cegep-catalog";
import { CEGEP_PROGRAM_OFFERINGS } from "@/lib/data/cegep-programs-catalog";
import { findCegepInstitution } from "@/lib/data/cegep-institutions";
import { useStudentProfile, resetProfile } from "@/lib/profile/store";
import { SELF_TAGS, tagLabel } from "@/lib/tags/taxonomy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";
import { createClient } from "@/lib/db/client";

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const f = useFormat();
  const { profile, toggleTag } = useStudentProfile();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    resetProfile();
    router.push("/onboarding");
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const results = await Promise.all([
        supabase.from("student_profiles").delete().eq("user_id", user.id),
        supabase.from("student_r_score_confirmations").delete().eq("user_id", user.id),
        supabase.from("student_targets").delete().eq("user_id", user.id),
        supabase.from("student_course_grades").delete().eq("user_id", user.id),
      ]);
      if (results.some((r) => r.error)) {
        setDeleting(false);
        setDeleteError(true);
        return;
      }
      await supabase.auth.signOut();
    }

    resetProfile();
    router.push("/onboarding");
  }

  const cegepName =
    CEGEPS.find((c) => c.id === profile.cegepId)?.name ??
    (profile.cegepId ? findCegepInstitution(profile.cegepId)?.name : null) ??
    "—";

  const programName =
    CEGEP_PROGRAM_OFFERINGS.find((p) => p.programCode === profile.cegepProgramId)?.programName ??
    CEGEP_DEC_PROGRAMS.find((p) => p.code === profile.cegepProgramId)?.nameFr ??
    CEGEP_PROGRAMS.find((p) => p.id === profile.cegepProgramId)?.name ??
    profile.cegepProgramId ??
    "—";

  const sessionLabel =
    SESSIONS.find((s) => s.id === profile.currentSession)?.[
      locale === "fr" ? "labelFr" : "labelEn"
    ] ?? (profile.currentSession ? `Session ${profile.currentSession}` : "—");

  const fields = [
    {
      label: t("prof.cegep"),
      value: cegepName,
    },
    {
      label: t("prof.program"),
      value: programName,
    },
    {
      label: t("prof.session"),
      value: sessionLabel,
    },
    {
      label: t("entry.label"),
      value:
        profile.rScore !== null
          ? `${f.score(profile.rScore)} (${profile.rScoreStatus === "confirmed" ? "confirmée" : "estimée"})`
          : locale === "fr"
            ? "En attente (1ère session)"
            : "Pending (1st session)",
    },
  ];

  const targetPrograms = UNIVERSITY_PROGRAMS.filter((p) =>
    profile.targetUniversityProgramIds.includes(p.id),
  );

  return (
    <AppShell rScore={profile.rScore ?? undefined}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-[27px] font-bold leading-tight tracking-tight text-ink">
            {t("prof.title")}
          </h1>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 rounded-full border border-ink/15 bg-paper px-3.5 py-1.5 text-[13px] font-semibold text-ink shadow-sm transition-all hover:bg-chalk active:scale-[0.97] disabled:opacity-50"
          >
            <LogOut className="h-3.5 w-3.5 text-ink/70" />
            <span>{t("account.logout")}</span>
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-ink/12 bg-paper shadow-card">
          <div className="flex items-center justify-between border-b border-ink/10 bg-chalk/30 px-4 py-2.5">
            <span className="text-[12px] font-semibold text-ink/60">Mon cheminement collégial</span>
            <Link
              href="/onboarding/cegep"
              className="flex items-center gap-1 text-[12px] font-semibold text-ultramarine hover:underline"
            >
              <Edit3 className="h-3 w-3" />
              <span>Modifier</span>
            </Link>
          </div>
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

        {/* Target University Programs */}
        <section className="flex flex-col gap-3 rounded-xl border border-ink/12 bg-paper p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-ultramarine" />
              <h2 className="font-display text-[16px] font-bold text-ink">Programmes universitaires visés</h2>
            </div>
            <Link
              href="/programs"
              className="text-[12px] font-semibold text-ultramarine hover:underline"
            >
              Explorer
            </Link>
          </div>
          {targetPrograms.length === 0 ? (
            <p className="text-[12.5px] text-ink/50">
              Aucun programme visé sélectionné pour l&apos;instant.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {targetPrograms.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg border border-ink/8 bg-chalk/30 p-2.5">
                  <div>
                    <span className="block text-[13px] font-semibold text-ink">{p.name}</span>
                    <span className="block text-[11px] text-ink/50">{p.institution}</span>
                  </div>
                  <Link href={`/programs/${p.id}`} className="text-[12px] font-semibold text-ultramarine">
                    Voir
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-ink/12 bg-paper p-4 shadow-card">
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
              const usedBy = BURSARIES.filter((b) => b.tagCriteria?.includes(tag.id)).length;

              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleTag(tag.id)}
                    className={`flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-[13px] font-semibold tap-spring ${
                      selected
                        ? "border-ultramarine bg-ultramarine text-paper shadow-sm"
                        : "border-ink/20 bg-paper text-ink/70 hover:border-ink/40"
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
          href="/profile/notifications"
          className="flex min-h-[56px] items-center justify-between gap-3 rounded-xl border border-ink/12 bg-paper px-4 py-3.5 shadow-card tap-spring hover:shadow-overlay"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ultramarine/[0.08] text-ultramarine">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[14px] font-semibold text-ink">
                {t("notif.title")}
              </span>
              <span className="block text-[11.5px] text-ink/50">
                {t("notif.subtitle")}
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-ink/40" />
        </Link>

        <div className="flex flex-col gap-3">
          <Link
            href="/counselor-prep"
            className="flex h-14 w-full items-center justify-center rounded-full border border-ink/25 bg-paper text-[15px] font-semibold text-ink transition-transform active:scale-[0.98] shadow-sm hover:bg-chalk"
          >
            {locale === "fr" ? "Préparer ma rencontre" : "Prepare my meeting"}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-ink/20 bg-paper text-[15px] font-semibold text-ink shadow-sm transition-transform active:scale-[0.98] hover:bg-chalk disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 text-ink/70" />
            <span>{t("account.logout")}</span>
          </button>
        </div>

        <section className="flex flex-col gap-2 rounded-xl border border-ember/30 bg-ember/[0.04] p-4">
          <h2 className="text-[14px] font-semibold text-ink">{t("account.deleteTitle")}</h2>
          <p className="text-[12.5px] leading-relaxed text-ink/60">{t("account.deleteBody")}</p>

          {deleteError && (
            <p className="text-[12.5px] text-ember">{t("account.deleteError")}</p>
          )}

          {confirmingDelete ? (
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex h-12 flex-1 items-center justify-center rounded-full bg-ember text-[13.5px] font-semibold text-paper transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {t("account.deleteConfirm")}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="flex h-12 flex-1 items-center justify-center rounded-full border border-ink/20 text-[13.5px] font-semibold text-ink transition-transform active:scale-[0.98]"
              >
                {t("account.deleteCancel")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="mt-1 inline-flex min-h-[44px] items-center text-[13px] font-semibold text-ember"
            >
              {t("account.deleteTitle")}
            </button>
          )}
        </section>
      </div>
    </AppShell>
  );
}

