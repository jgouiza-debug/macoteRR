"use client";

import { Check } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useTargets } from "@/lib/profile/useTargets";

/**
 * The detail page's target toggle. Goes through useTargets like every other place that
 * touches the list, so a tap here reaches the outbox the same way the goal wizard's save does.
 * `programName` gives the button an accessible name that says which program it toggles; the
 * visible label stays inside that name so it still reads the same on screen and to a reader.
 */
export function AddTargetButton({
  programId,
  programName,
}: {
  programId: string;
  programName?: string;
}) {
  const { t } = useLocale();
  const { has, toggle } = useTargets();
  const added = has(programId);
  const label = added ? t("prog.added") : t("prog.addTarget");

  return (
    <button
      type="button"
      onClick={() => toggle(programId)}
      aria-pressed={added}
      aria-label={programName ? `${label} · ${programName}` : undefined}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold shadow-card tap-spring ${
        added ? "bg-moss/15 text-moss border border-moss/25" : "bg-ultramarine text-paper"
      }`}
    >
      {added && <Check className="h-[18px] w-[18px] animate-pop-in stroke-[2.5]" aria-hidden="true" />}
      {label}
    </button>
  );
}
