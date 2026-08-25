/**
 * Career-interest domains. Self-selected or derived from the quick quiz in
 * src/lib/matching/interest-quiz.ts — used only to surface relevant university programs
 * during onboarding. Distinct from SelfTagId (taxonomy.ts), which is reserved for bursary
 * self-tagging per GUARDRAIL #3 and must never be reused for program matching.
 */

export type InterestId =
  | "health"
  | "tech_eng"
  | "business"
  | "law_social"
  | "science"
  | "arts_comm"
  | "education"
  | "environment";

export type Interest = { id: InterestId; fr: string; en: string };

export const INTERESTS: Interest[] = [
  { id: "health", fr: "Santé", en: "Health" },
  { id: "tech_eng", fr: "Technologie et génie", en: "Technology & engineering" },
  { id: "business", fr: "Affaires et gestion", en: "Business & management" },
  { id: "law_social", fr: "Droit et sciences sociales", en: "Law & social sciences" },
  { id: "science", fr: "Sciences pures", en: "Pure sciences" },
  { id: "arts_comm", fr: "Arts et communication", en: "Arts & communication" },
  { id: "education", fr: "Éducation", en: "Education" },
  { id: "environment", fr: "Environnement", en: "Environment" },
];

export const INTEREST_BY_ID = new Map(INTERESTS.map((i) => [i.id, i]));

export function interestLabel(id: InterestId, locale: "fr" | "en"): string {
  const interest = INTEREST_BY_ID.get(id);
  if (!interest) return id;
  return locale === "fr" ? interest.fr : interest.en;
}
