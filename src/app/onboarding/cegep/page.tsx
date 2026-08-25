"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { CEGEPS } from "@/lib/sample-data";
import { useStudentProfile } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function CegepPickerPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { update } = useStudentProfile();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(
    () => CEGEPS.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );

  function choose(id: string) {
    setSelected(id);
    update({ cegepId: id });
    // Give the selected state a beat to paint before leaving, so the tap reads as confirmed.
    window.setTimeout(() => router.push("/onboarding/account"), 180);
  }

  return (
    <ScreenShell
      backHref="/onboarding/results"
      footer={
        <button
          type="button"
          onClick={() => router.push("/onboarding/account")}
          className="h-12 w-full text-[14px] font-semibold text-ink/60"
        >
          {t("common.skip")}
        </button>
      }
    >
      <ScreenHeading title={t("cegep.title")} body={t("cegep.body")} />

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t("cegep.search")}
          placeholder={t("cegep.search")}
          autoComplete="off"
          className="h-[52px] w-full rounded border border-ink/15 bg-paper pl-11 pr-4 text-[16px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-[1.5px] focus:border-ultramarine"
        />
      </div>

      <div role="listbox" aria-label={t("cegep.title")} className="flex flex-col gap-2.5 pb-4">
        {filtered.map((cegep) => {
          const isSelected = selected === cegep.id;
          return (
            <button
              key={cegep.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => choose(cegep.id)}
              className={`flex min-h-[56px] items-center justify-between gap-3 rounded px-4 py-3 text-left text-[15px] transition-[transform,background-color,border-color,color] active:scale-[0.99] ${
                isSelected
                  ? "border-[1.5px] border-ultramarine bg-ultramarine/[0.07] font-semibold text-ultramarine"
                  : "border border-ink/15 bg-paper text-ink"
              }`}
            >
              <span className="leading-snug">{cegep.name}</span>
              {isSelected && <Check className="h-5 w-5 flex-shrink-0" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-[14px] text-ink/50">{t("cegep.empty")}</p>
        )}
      </div>
    </ScreenShell>
  );
}
