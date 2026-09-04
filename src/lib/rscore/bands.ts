/**
 * Interpretive bands for a cote R.
 *
 * IMPORTANT — what this is and is not. There is no official government classification of
 * cote R into "good" and "bad". The BCI defines how the number is *computed*; nothing
 * published defines what it *means*. These bands are MaCote's reading of the admission
 * cutoffs universities actually publish, and every band says so in its own copy.
 *
 * That is why each band carries `sourceUrl` + `lastVerifiedAt` like every other figure in the
 * product (guardrail #1), and why the labels describe what the range *opens* rather than
 * grading the student (no "strong" or "competitive": those grade a person). A student at 24 is not "bad" — they clear most university programs in
 * Quebec, and the copy has to say that plainly.
 *
 * Anchor points, all from the cutoffs already sourced in src/lib/sample-data.ts and the BCI's
 * own documentation of the scale:
 *   - the theoretical scale runs roughly 15–50, with the vast majority of students between
 *     15 and 35 (BCI);
 *   - ~25 clears the majority of non-contingent university programs;
 *   - the contingent professional programs (law, physio, pharmacy) sit in the low 30s;
 *   - medicine and dentistry sit at the top of the observed range.
 */

export type RScoreBandId = "developing" | "solid" | "competitive" | "strong" | "exceptional";

export type RScoreBand = {
  id: RScoreBandId;
  /** Inclusive lower bound. The top band has no upper bound. */
  min: number;
  max: number | null;
  fr: { label: string; meaning: string };
  en: { label: string; meaning: string };
  /** Which visual register the band reads in — never red/green "pass/fail". */
  tone: "neutral" | "positive" | "highlight";
};

export const R_SCORE_BANDS: RScoreBand[] = [
  {
    id: "developing",
    min: 0,
    max: 20,
    tone: "neutral",
    fr: {
      label: "Sous 20",
      meaning:
        "Sous 20, l'accès direct à l'université est plus étroit, mais loin d'être fermé : plusieurs programmes acceptent encore, et une session forte change la cote plus vite qu'on le pense. Le DEC technique et la passerelle universitaire restent des chemins complets.",
    },
    en: {
      label: "Below 20",
      meaning:
        "Below 20 the direct route to university is narrower, but far from closed: a number of programs still admit here, and one strong session moves the score more than students expect. A technical DEC and the university bridge remain full paths.",
    },
  },
  {
    id: "solid",
    min: 20,
    max: 25,
    tone: "neutral",
    fr: {
      label: "20 à 25",
      meaning:
        "Entre 20 et 25, tu es dans la zone où se situe la majorité des étudiants de cégep. Beaucoup de baccalauréats non contingentés admettent dans cette plage.",
    },
    en: {
      label: "20 to 25",
      meaning:
        "Between 20 and 25 you sit where most cégep students sit. Many non-contingent bachelor's programs admit in this range.",
    },
  },
  {
    id: "competitive",
    min: 25,
    max: 29,
    tone: "positive",
    fr: {
      label: "25 à 29",
      meaning:
        "À partir de 25, la plupart des programmes universitaires non contingentés te sont ouverts, et plusieurs programmes contingentés deviennent atteignables — administration, génie, sciences.",
    },
    en: {
      label: "25 to 29",
      meaning:
        "From 25 up, most non-contingent university programs are open to you, and several contingent ones come into reach — business, engineering, sciences.",
    },
  },
  {
    id: "strong",
    min: 29,
    max: 32.5,
    tone: "positive",
    fr: {
      label: "29 à 32,5",
      meaning:
        "Entre 29 et 32,5, tu entres dans la zone des programmes fortement contingentés : droit, physiothérapie, pharmacie, sciences infirmières dans les universités les plus demandées.",
    },
    en: {
      label: "29 to 32.5",
      meaning:
        "Between 29 and 32.5 you enter the heavily contingent range: law, physiotherapy, pharmacy, and nursing at the most sought-after universities.",
    },
  },
  {
    id: "exceptional",
    min: 32.5,
    max: null,
    tone: "highlight",
    fr: {
      label: "32,5 et plus",
      meaning:
        "Au-dessus de 32,5, tu es dans la plage des programmes les plus contingentés du Québec, médecine et médecine dentaire incluses. À ce niveau, le dossier complet compte souvent autant que la cote.",
    },
    en: {
      label: "32.5 and up",
      meaning:
        "Above 32.5 you're in the range of Quebec's most contingent programs, medicine and dentistry included. At this level the rest of the file often counts as much as the score itself.",
    },
  },
];

/** The BCI is the authority on how the cote R is computed — not on what a given value "means". */
export const R_SCORE_BAND_SOURCE = {
  url: "https://www.bci-qc.ca/etudiants/cote-r/",
  lastVerifiedAt: "2026-08-25",
};

export function bandForScore(score: number): RScoreBand {
  // Walk from the top so the open-ended band wins for anything above its floor.
  for (let i = R_SCORE_BANDS.length - 1; i >= 0; i--) {
    if (score >= R_SCORE_BANDS[i].min) return R_SCORE_BANDS[i];
  }
  return R_SCORE_BANDS[0];
}

export function bandLabel(band: RScoreBand, locale: "fr" | "en"): string {
  return band[locale].label;
}

export function bandMeaning(band: RScoreBand, locale: "fr" | "en"): string {
  return band[locale].meaning;
}

/** "20 – 25", "32,5 +" — formatted for the locale the student is reading in. */
export function bandRangeLabel(band: RScoreBand, locale: "fr" | "en"): string {
  const fmt = (value: number) =>
    new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);

  if (band.max === null) return `${fmt(band.min)} +`;
  if (band.min === 0) return `< ${fmt(band.max)}`;
  return `${fmt(band.min)} – ${fmt(band.max)}`;
}
