"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight, LogOut, GraduationCap, Edit3, X } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { useReferenceCatalog } from "@/lib/data/reference-store";
import { resolveCegepName, resolveDecName } from "@/lib/data/resolve-names";
import { useStudentProfile, resetProfile } from "@/lib/profile/store";
import { useTargets } from "@/lib/profile/useTargets";
import { withFunnelParams } from "@/lib/profile/funnel-nav";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { SELF_TAGS, tagLabel } from "@/lib/tags/taxonomy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";
import { ScoreValue } from "@/components/rscore/ScoreValue";
import { createClient } from "@/lib/db/client";

/** "Modifier" on the profile re-enters one funnel step and comes straight back here. */
const EDIT_PATHWAY_HREF = withFunnelParams("/onboarding/cegep", { edit: true, next: "/profile" });
const EDIT_SCORE_HREF = withFunnelParams("/onboarding/score", { edit: true, next: "/profile" });

const editLinkClass =
  "inline-flex min-h-[44px] items-center gap-1 rounded-full border border-ink/15 px-3 text-[12px] font-semibold text-ultramarine tap-spring hover:bg-chalk";

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const f = useFormat();
  const { profile, toggleTag, sync } = useStudentProfile();
  const targets = useTargets();
  const hydrated = useHydrated();
  const { sessions, universityPrograms, bursaries } = useReferenceCatalog();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(false);

  // The hydration render sees the server snapshot (an empty profile) and a signed-in student's
  // first reconcile may still be pulling; neither is a profile to redirect on or render "—" for.
  const ready = hydrated && sync !== "syncing";

  useEffect(() => {
    if (ready && profile.cegepId === null) router.replace("/onboarding");
  }, [ready, profile.cegepId, router]);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError(false);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      resetProfile();
      router.push("/onboarding");
    } catch {
      setLogoutError(true);
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(false);
    try {
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
          supabase.from("notification_preferences").delete().eq("user_id", user.id),
          supabase.from("notification_events").delete().eq("user_id", user.id),
        ]);
        if (results.some((r) => r.error)) throw new Error("delete failed");
        await supabase.auth.signOut();
      }

      resetProfile();
      router.push("/onboarding");
    } catch {
      setDeleteError(true);
    } finally {
      setDeleting(false);
    }
  }

  if (!ready || profile.cegepId === null) {
    return (
      <AppShell
        rScore={profile.rScore}
        rScoreStatus={profile.rScoreStatus}
        currentSession={profile.currentSession}
        footer={false}
      >
        <div
          className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-4 py-6"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="h-8 w-28 animate-pulse rounded bg-ink/8" />
          <div className="h-56 animate-pulse rounded-xl border border-ink/8 bg-paper" />
          <div className="h-32 animate-pulse rounded-xl border border-ink/8 bg-paper" />
          <div className="h-64 animate-pulse rounded-xl border border-ink/8 bg-paper" />
        </div>
      </AppShell>
    );
  }

  const cegepName = resolveCegepName(profile.cegepId) ?? profile.cegepId;
  const programName = resolveDecName(profile.cegepProgramId, locale) ?? profile.cegepProgramId ?? "—";

  const session = sessions.find((s) => s.id === profile.currentSession);
  const sessionLabel = session
    ? locale === "fr"
      ? session.labelFr
      : session.labelEn
    : profile.currentSession !== null
      ? t("prof.sessionN").replace("{n}", String(profile.currentSession))
      : "—";

  const isConfirmed = profile.rScoreStatus === "confirmed";
  const entered = profile.rScoreUpdatedAt
    ? t("dash.scoreEnteredOn").replace("{date}", f.date(profile.rScoreUpdatedAt))
    : t("dash.scoreEntered");

  const fields = [
    { label: t("prof.cegep"), value: cegepName },
    { label: t("prof.program"), value: programName },
    { label: t("prof.session"), value: sessionLabel },
  ];

  const targetPrograms = universityPrograms.filter((p) => targets.ids.includes(p.id));

  return (
    <AppShell
      rScore={profile.rScore}
      rScoreStatus={profile.rScoreStatus}
      currentSession={profile.currentSession}
    >
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-4 py-6">
        <div>
          <h1 className="font-display text-[27px] font-bold leading-tight tracking-tight text-ink">
            {t("prof.title")}
          </h1>
        </div>

        <div className="overflow-hidden rounded-xl border border-ink/12 bg-paper shadow-card">
          <div className="flex items-center justify-between border-b border-ink/10 bg-chalk/30 px-4">
            <span className="text-[12px] font-semibold text-ink/60">{t("prof.pathwayTitle")}</span>
            <Link href={EDIT_PATHWAY_HREF} aria-label={t("prof.editPathway")} className={editLinkClass}>
              <Edit3 className="h-3 w-3" aria-hidden="true" />
              <span>{t("common.edit")}</span>
            </Link>
          </div>
          {fields.map((field) => (
            <div
              key={field.label}
              className="flex items-center justify-between gap-4 border-b border-ink/10 px-4 py-3.5"
            >
              <span className="text-[12px] font-semibold text-ink/50">{field.label}</span>
              <span className="text-right text-[14px] font-semibold text-ink">{field.value}</span>
            </div>
          ))}

          {/* Score row: its own "Modifier", and an estimate is never dressed as the cégep's figure. */}
          <div className="flex items-center justify-between gap-4 px-4 pt-1.5 pb-1">
            <span className="text-[12px] font-semibold text-ink/50">{t("entry.label")}</span>
            <div className="flex items-center gap-3">
              {profile.rScore === null ? (
                <span className="text-right text-[14px] font-semibold text-ink">{t("prof.scorePending")}</span>
              ) : isConfirmed ? (
                <span className="text-right text-[14px] font-semibold text-ink tabular-nums">
                  <ScoreValue value={profile.rScore} status="confirmed" size="inline" /> {t("prof.scoreConfirmed")}
                </span>
              ) : (
                <ScoreValue
                  value={profile.rScore}
                  status={profile.rScoreStatus}
                  size="sm"
                  framed
                  className="text-ink"
                />
              )}
              <Link href={EDIT_SCORE_HREF} aria-label={t("prof.editScore")} className={editLinkClass}>
                <Edit3 className="h-3 w-3" aria-hidden="true" />
                <span>{t("common.edit")}</span>
              </Link>
            </div>
          </div>
          {/* GUARDRAIL #1 for the student's own figure: where it came from and when it was entered. */}
          {profile.rScore !== null && (
            <p className="px-4 pb-3 text-[11px] leading-snug text-ink/45">
              {isConfirmed ? t("dash.scoreConfirmedBy") : t("dash.scoreEstimatedFrom")} · {entered}
            </p>
          )}
        </div>

        {/* Target University Programs */}
        <section className="flex flex-col gap-3 rounded-xl border border-ink/12 bg-paper p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-ultramarine" aria-hidden="true" />
              <h2 className="font-display text-[16px] font-bold text-ink">{t("prof.targetsTitle")}</h2>
            </div>
            <Link href="/programs" className={editLinkClass}>
              {t("prof.explore")}
            </Link>
          </div>
          {targetPrograms.length === 0 ? (
            <EmptyState
              compact
              title={t("prof.noTargets")}
              action={{ href: "/programs", label: t("prof.explore") }}
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {targetPrograms.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-ink/8 bg-chalk/30 py-1 pl-3 pr-1"
                >
                  <div className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-ink">{p.name}</span>
                    <span className="block text-[11px] text-ink/50">{p.institution}</span>
                  </div>
                  <Link
                    href={`/programs/${p.id}`}
                    aria-label={t("prof.viewTarget").replace("{name}", p.name)}
                    className={editLinkClass}
                  >
                    {t("prof.view")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => targets.remove(p.id)}
                    aria-label={t("prof.removeTarget").replace("{name}", p.name)}
                    className="inline-flex min-h-[44px] flex-shrink-0 items-center gap-1 rounded-full border border-ink/15 px-3 text-[12px] font-semibold text-ink/60 tap-spring hover:bg-chalk hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("common.remove")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-ink/12 bg-paper p-4 shadow-card">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[17px] font-bold text-ink">{t("prof.tagsTitle")}</h2>
            <span className="text-[11.5px] text-ink/50 tabular-nums" aria-live="polite">
              {t("prof.tagsCount").replace("{n}", String(profile.selfTags.length))}
            </span>
          </div>

          <p className="text-[12.5px] leading-relaxed text-ink/60">{t("prof.tagsHelp")}</p>
          <p className="text-[11.5px] leading-relaxed text-ink/50">{t("prof.tagsLegend")}</p>

          <ul className="flex flex-wrap gap-2">
            {SELF_TAGS.map((tag) => {
              const selected = profile.selfTags.includes(tag.id);
              const usedBy = bursaries.filter((b) => b.tagCriteria?.includes(tag.id)).length;

              return (
                <li key={tag.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleTag(tag.id)}
                    className={`flex min-h-[48px] items-center gap-2 rounded-full border px-4 text-[13px] font-semibold tap-spring ${
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
              <Bell className="h-4 w-4" aria-hidden="true" />
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
          <ChevronRight className="h-5 w-5 text-ink/40" aria-hidden="true" />
        </Link>

        <div className="flex flex-col gap-3">
          <Link
            href="/counselor-prep"
            className="flex h-14 w-full items-center justify-center rounded-full border border-ink/25 bg-paper text-[15px] font-semibold text-ink transition-transform active:scale-[0.98] shadow-sm hover:bg-chalk"
          >
            {t("prof.prepareMeeting")}
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full border border-ink/20 bg-paper text-[15px] font-semibold text-ink shadow-sm transition-transform active:scale-[0.98] hover:bg-chalk disabled:opacity-50"
          >
            <LogOut className="h-4 w-4 text-ink/70" aria-hidden="true" />
            <span>{t("account.logout")}</span>
          </button>
          {logoutError && (
            <p className="text-center text-[12.5px] text-ember" role="alert">
              {t("account.logoutError")}
            </p>
          )}
        </div>

        <section className="flex flex-col gap-2 rounded-xl border border-ember/30 bg-ember/[0.04] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <h2 className="text-[14px] font-semibold text-ink">{t("account.deleteTitle")}</h2>
          <p className="text-[12.5px] leading-relaxed text-ink/60">{t("account.deleteBody")}</p>

          {deleteError && (
            <p className="text-[12.5px] text-ember" role="alert">
              {t("account.deleteError")}
            </p>
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
                className="flex h-12 flex-1 items-center justify-center rounded-full border border-ink/20 text-[13.5px] font-semibold text-ink transition-transform active:scale-[0.98] disabled:opacity-50"
              >
                {t("account.deleteCancel")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="mt-1 inline-flex min-h-[48px] items-center text-[13px] font-semibold text-ember"
            >
              {t("account.deleteTitle")}
            </button>
          )}
        </section>
      </div>
    </AppShell>
  );
}
