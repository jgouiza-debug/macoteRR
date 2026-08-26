"use client";

import { Check } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useStudentProfile } from "@/lib/profile/store";

export function AddTargetButton({ programId }: { programId: string }) {
  const { t } = useLocale();
  const { profile, update } = useStudentProfile();
  const added = profile.targetUniversityProgramIds.includes(programId);

  function handleToggle() {
    const nextTargets = added
      ? profile.targetUniversityProgramIds.filter((id) => id !== programId)
      : [...profile.targetUniversityProgramIds, programId];
    update({ targetUniversityProgramIds: nextTargets });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={added}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold shadow-card tap-spring ${
        added ? "bg-moss/15 text-moss border border-moss/25" : "bg-ultramarine text-paper"
      }`}
    >
      {added && <Check className="h-[18px] w-[18px] animate-pop-in stroke-[2.5]" />}
      {added ? t("prog.added") : t("prog.addTarget")}
    </button>
  );
}
