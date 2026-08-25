"use client";

import { Check } from "lucide-react";
import { useStudentProfile } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Persists the target rather than toggling a local boolean, so a program added here shows up
 * in the profile's targets list and syncs to `student_targets` alongside the ones the
 * onboarding quiz picked.
 */
export function AddTargetButton({ programId }: { programId: string }) {
  const { t } = useLocale();
  const { profile, toggleTarget } = useStudentProfile();
  const added = profile.targetUniversityProgramIds.includes(programId);

  return (
    <button
      type="button"
      onClick={() => toggleTarget(programId)}
      aria-pressed={added}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold shadow-card transition-transform transition-colors active:scale-[0.98] ${
        added ? "bg-moss/10 text-moss" : "bg-ultramarine text-paper"
      }`}
    >
      {added && <Check className="h-[18px] w-[18px]" />}
      {added ? t("prog.added") : t("prog.addTarget")}
    </button>
  );
}
