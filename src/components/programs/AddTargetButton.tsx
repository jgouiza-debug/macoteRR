"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function AddTargetButton() {
  const { t } = useLocale();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setAdded((v) => !v)}
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
