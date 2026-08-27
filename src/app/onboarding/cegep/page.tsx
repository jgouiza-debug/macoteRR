"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Check } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { CEGEP_INSTITUTIONS } from "@/lib/data/cegep-institutions";
import { useStudentProfile } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/** Accent-insensitive, so "cegep" matches "Cégep" and "merici" matches "Mérici". */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Step 1 of the funnel. It moved to the front because the DEC picker after it is scoped by
 * this answer — asking for a program first meant offering programs the student's cégep does
 * not run.
 *
 * The list comes from CEGEP_INSTITUTIONS (the eleven institutions the scrape actually covers)
 * rather than sample-data's six-entry `CEGEPS` stub, so Limoilou's two campuses, the
 * conservatoire, and the four private colleges are all selectable.
 */
export default function CegepPickerPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { profile, update } = useStudentProfile();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(profile.cegepId);

  useEffect(() => {
    // Lock history on step 1 of onboarding so browser back gesture/button stays on step 1
    // instead of bouncing out to the landing page / website.
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = fold(query);
    if (!q) return CEGEP_INSTITUTIONS;
    return CEGEP_INSTITUTIONS.filter((c) => fold(c.name).includes(q));
  }, [query]);

  function choose(shortCode: string) {
    setSelected(shortCode);

    // Changing cégep invalidates the DEC below it: the previous pick may not be offered at the
    // new school, and carrying it over would silently misstate what the student is enrolled in.
    update(
      profile.cegepId === shortCode
        ? { cegepId: shortCode }
        : { cegepId: shortCode, cegepProgramId: null },
    );

    // Give the selected state a beat to paint before leaving, so the tap reads as confirmed.
    window.setTimeout(() => router.push("/onboarding/program"), 180);
  }

  return (
    <ScreenShell brand>
      <ScreenHeading title={t("cegep.title")} body={t("cegep.body")} />

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          aria-label={t("cegep.search")}
          placeholder={t("cegep.search")}
          autoComplete="off"
          className="h-[52px] w-full rounded border border-ink/15 bg-paper pl-11 pr-4 text-[16px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-[1.5px] focus:border-ultramarine"
        />
      </div>

      <p className="mb-3 text-[12px] text-ink/45">
        {t("cegep.count").replace("{n}", String(CEGEP_INSTITUTIONS.length))}
      </p>

      <div role="listbox" aria-label={t("cegep.title")} className="flex flex-col gap-2.5 pb-4">
        {filtered.map((cegep) => {
          const isSelected = selected === cegep.shortCode;
          return (
            <button
              key={cegep.shortCode}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => choose(cegep.shortCode)}
              className={`flex min-h-[56px] items-center justify-between gap-3 rounded px-4 py-3 text-left transition-[transform,background-color,border-color,color] active:scale-[0.99] ${
                isSelected
                  ? "border-[1.5px] border-ultramarine bg-ultramarine/[0.07] text-ultramarine"
                  : "border border-ink/15 bg-paper text-ink"
              }`}
            >
              <span className="min-w-0 flex-1">
                <span
                  className={`block wrap-fr text-[15px] leading-snug ${isSelected ? "font-semibold" : ""}`}
                >
                  {cegep.name}
                </span>
                <span
                  className={`mt-0.5 block text-[12px] tabular-nums ${isSelected ? "text-ultramarine/70" : "text-ink/45"}`}
                >
                  {cegep.programCount}{" "}
                  {locale === "fr"
                    ? `programme${cegep.programCount === 1 ? "" : "s"}`
                    : `program${cegep.programCount === 1 ? "" : "s"}`}
                </span>
              </span>
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
