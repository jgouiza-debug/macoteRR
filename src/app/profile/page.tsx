"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { BURSARIES, CEGEPS, CEGEP_PROGRAMS, SESSIONS } from "@/lib/sample-data";
import { useStudentProfile, resetProfile } from "@/lib/profile/store";
import { SELF_TAGS, tagLabel } from "@/lib/tags/taxonomy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { createClient } from "@/lib/db/client";

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { profile, toggleTag } = useStudentProfile();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

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

  const fields = [
    {
      label: t("prof.cegep"),
      value: CEGEPS.find((c) => c.id === profile.cegepId)?.name ?? "—",
    },
    {
      label: t("prof.program"),
      value: CEGEP_PROGRAMS.find((p) => p.id === profile.cegepProgramId)?.name ?? "—",
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
          className="flex min-h-[56px] items-center justify-between gap-3 rounded border border-ink/12 bg-paper px-4 py-3.5 shadow-card tap-spring hover:shadow-overlay"
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
            className="flex h-14 w-full items-center justify-center rounded-full border border-ink/25 bg-paper text-[15px] font-semibold text-ink transition-transform active:scale-[0.98]"
          >
            {locale === "fr" ? "Préparer ma rencontre" : "Prepare my meeting"}
          </Link>
        </div>

        <section className="flex flex-col gap-2 rounded border border-ember/30 bg-ember/[0.04] p-4">
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

