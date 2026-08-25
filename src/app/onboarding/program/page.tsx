"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { SearchableList, type ListOption } from "@/components/onboarding/SearchableList";
import {
  CEGEP_PROGRAM_TYPE_ORDER,
  findCegep,
  programTypeLabel,
  programsForCegep,
} from "@/lib/data/catalog";
import { useStudentProfile } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Step 2. The list is scoped to the cégep chosen in step 1 — 150 programs across eleven
 * schools becomes the 4–36 a given student can actually be enrolled in.
 */
export default function ProgramPickerPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { profile, update } = useStudentProfile();
  const [selected, setSelected] = useState<string | null>(profile.cegepProgramId);

  const cegep = findCegep(profile.cegepId);

  // A student who deep-links here (or cleared storage) has no cégep to filter by; send them
  // back rather than rendering an empty list with no explanation.
  useEffect(() => {
    if (!profile.cegepId) router.replace("/onboarding/cegep");
  }, [profile.cegepId, router]);

  const programs = useMemo(() => programsForCegep(profile.cegepId), [profile.cegepId]);

  const options: ListOption[] = useMemo(
    () =>
      programs.map((program) => ({
        id: program.id,
        label: program.name,
        detail: program.code || undefined,
        group: program.type,
      })),
    [programs],
  );

  const groupLabels = useMemo(
    () =>
      CEGEP_PROGRAM_TYPE_ORDER.map((type) => ({
        key: type,
        label: programTypeLabel(type, locale),
      })),
    [locale],
  );

  function choose(programId: string) {
    setSelected(programId);
    update({ cegepProgramId: programId });
    window.setTimeout(() => router.push("/onboarding/score"), 180);
  }

  if (!cegep) return null;

  return (
    <ScreenShell backHref="/onboarding/cegep">
      <StepProgress step="program" />
      <ScreenHeading
        title={t("cprog.title")}
        body={t("cprog.body").replace("{cegep}", cegep.name)}
      />

      <SearchableList
        options={options}
        selectedId={selected}
        onSelect={choose}
        searchLabel={t("cprog.search")}
        emptyLabel={t("cprog.empty")}
        groupLabels={groupLabels}
        footerNote={t("cprog.count").replace("{n}", String(programs.length))}
      />
    </ScreenShell>
  );
}
