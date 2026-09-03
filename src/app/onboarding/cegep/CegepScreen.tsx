"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Check } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { CEGEP_INSTITUTIONS } from "@/lib/data/cegep-institutions";
import { useStudentProfile } from "@/lib/profile/store";
import { useFunnelNav } from "@/lib/profile/funnel-nav";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/** How long the selected row stays painted before the screen advances, so the tap reads as confirmed. */
const CONFIRM_DELAY_MS = 180;

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
 *
 * The step is exitable backwards (top-bar back to the welcome screen). It used to pin the
 * browser history with a pushState/popstate loop so "back" could never leave onboarding —
 * which also trapped a signed-in student who came here from the profile to change one thing.
 */
export function CegepScreen() {
  const { t } = useLocale();
  const { profile, update, sync } = useStudentProfile();
  const { hrefFor, goTo, finishStep } = useFunnelNav();
  const hydrated = useHydrated();
  const [query, setQuery] = useState("");
  /** The row just tapped; null until then, so the highlight falls back to the saved cégep. */
  const [tapped, setTapped] = useState<string | null>(null);
  /** True from the tap until navigation: the rows are disabled so a double-tap cannot fire twice. */
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = fold(query);
    if (!q) return CEGEP_INSTITUTIONS;
    return CEGEP_INSTITUTIONS.filter((c) => fold(c.name).includes(q));
  }, [query]);

  // The store's hydration snapshot is the empty profile, and a signed-in student's first
  // reconcile may still be pulling the server copy. Until both settle, `profile.cegepId` is
  // not the student's real answer, so neither the highlight nor the "did it change" decision
  // below can be trusted. Hooks all sit above this; only the list swaps for a skeleton.
  const ready = hydrated && sync !== "syncing";
  const selected = tapped ?? profile.cegepId;

  function choose(shortCode: string) {
    if (leaving) return;
    setTapped(shortCode);
    setLeaving(true);

    // Changing cégep invalidates the DEC below it: the previous pick may not be offered at the
    // new school, and carrying it over would silently misstate what the student is enrolled in.
    // Re-picking the same cégep keeps the DEC.
    const changed = profile.cegepId !== shortCode;
    update(changed ? { cegepId: shortCode, cegepProgramId: null } : { cegepId: shortCode });

    // Give the selected state a beat to paint before leaving, so the tap reads as confirmed.
    timerRef.current = window.setTimeout(() => {
      // A changed cégep must re-pick the DEC even in edit mode, so it goes to the program step
      // with ?edit/?next intact. An unchanged one is "done" — in edit mode that returns to
      // `next`, in the funnel it advances.
      if (changed) goTo("/onboarding/program");
      else finishStep("/onboarding/program");
    }, CONFIRM_DELAY_MS);
  }

  return (
    <ScreenShell backHref={hrefFor("/onboarding/welcome")}>
      <ScreenHeading title={t("cegep.title")} body={t("cegep.body")} />

      <div className="relative mb-3">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/40"
        />
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

      {!ready ? (
        <div className="flex flex-col gap-2.5 pb-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded border border-ink/8 bg-paper motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <ul aria-label={t("cegep.title")} className="flex list-none flex-col gap-2.5 pb-4">
          {filtered.map((cegep) => {
            const isSelected = selected === cegep.shortCode;
            return (
              <li key={cegep.shortCode}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  disabled={leaving}
                  onClick={() => choose(cegep.shortCode)}
                  className={`flex min-h-[56px] w-full items-center justify-between gap-3 rounded px-4 py-3 text-left transition-[transform,background-color,border-color,color] active:scale-[0.99] ${
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
                      {(cegep.programCount === 1
                        ? t("cegep.programCountOne")
                        : t("cegep.programCountMany")
                      ).replace("{n}", String(cegep.programCount))}
                    </span>
                  </span>
                  {isSelected && <Check aria-hidden="true" className="h-5 w-5 flex-shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      <div aria-live="polite">
        {ready && filtered.length === 0 && (
          <p className="py-8 text-center text-[14px] text-ink/50">{t("cegep.empty")}</p>
        )}
      </div>
    </ScreenShell>
  );
}
