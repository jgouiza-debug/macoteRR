/**
 * Fixed self-tag list. Per docs/03-bursary-matching-system.md these are entirely
 * self-selected by the student, the way a resume lists activities: nothing here is
 * inferred, scored, or verified by the product.
 *
 * GUARDRAIL #3 (docs/00-BUILD-PROMPT.md): never collect income, household size, or any
 * other financial-need signal. Do not add a tag to this list that proxies for financial
 * status (household income, first-generation, receiving aid) — matching on those is
 * explicitly out of scope for this product.
 */

export type SelfTagId =
  | "sports"
  | "arts_culture"
  | "community_engagement"
  | "leadership"
  | "entrepreneurship"
  | "volunteering"
  | "research"
  | "international_mobility"
  | "environment"
  | "perseverance";

export type SelfTag = {
  id: SelfTagId;
  fr: string;
  en: string;
};

export const SELF_TAGS: SelfTag[] = [
  { id: "sports", fr: "Sport", en: "Athletics" },
  { id: "arts_culture", fr: "Arts et culture", en: "Arts & culture" },
  { id: "community_engagement", fr: "Engagement communautaire", en: "Community engagement" },
  { id: "leadership", fr: "Leadership", en: "Leadership" },
  { id: "entrepreneurship", fr: "Entrepreneuriat", en: "Entrepreneurship" },
  { id: "volunteering", fr: "Bénévolat", en: "Volunteering" },
  { id: "research", fr: "Recherche scientifique", en: "Scientific research" },
  { id: "international_mobility", fr: "Mobilité internationale", en: "International mobility" },
  { id: "environment", fr: "Environnement", en: "Environment" },
  { id: "perseverance", fr: "Persévérance", en: "Perseverance" },
];

export const SELF_TAG_BY_ID = new Map(SELF_TAGS.map((tag) => [tag.id, tag]));

export function tagLabel(id: SelfTagId, locale: "fr" | "en"): string {
  const tag = SELF_TAG_BY_ID.get(id);
  if (!tag) return id;
  return locale === "fr" ? tag.fr : tag.en;
}
