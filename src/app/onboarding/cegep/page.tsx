"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { SearchableList, type ListOption } from "@/components/onboarding/SearchableList";
import { CATALOG_CEGEPS, programsForCegep } from "@/lib/data/catalog";
import { useStudentProfile } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Step 1. Everything downstream is filtered by this answer, which is why it moved to the
 * front of the funnel: picking a program before a cégep meant showing a student programs
 * their school does not offer.
 */
export default function CegepPickerPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { profile, update } = useStudentProfile();
  const [selected, setSelected] = useState<string | null>(profile.cegepId);

  const options: ListOption[] = useMemo(
    () =>
      CATALOG_CEGEPS.map((cegep) => {
        const count = programsForCegep(cegep.shortCode).length;
        return {
          id: cegep.shortCode,
          label: cegep.name,
          detail:
            locale === "fr"
              ? `${count} programme${count === 1 ? "" : "s"}`
              : `${count} program${count === 1 ? "" : "s"}`,
        };
      }),
    [locale],
  );

  function choose(shortCode: string) {
    setSelected(shortCode);

    // Changing cégep invalidates the program below it — a slug is scoped to one school, so
    // keeping it would carry a program the new cégep does not offer into the profile.
    const patch =
      profile.cegepId === shortCode
        ? { cegepId: shortCode }
        : { cegepId: shortCode, cegepProgramId: null };
    update(patch);

    // Let the selected state paint before leaving, so the tap reads as confirmed.
    window.setTimeout(() => router.push("/onboarding/program"), 180);
  }

  return (
    <ScreenShell backHref="/">
      <StepProgress step="cegep" />
      <ScreenHeading title={t("cegep.title")} body={t("cegep.body")} />

      <SearchableList
        options={options}
        selectedId={selected}
        onSelect={choose}
        searchLabel={t("cegep.search")}
        emptyLabel={t("cegep.empty")}
        footerNote={t("cegep.count").replace("{n}", String(CATALOG_CEGEPS.length))}
      />
    </ScreenShell>
  );
}
