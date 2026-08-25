import type { InterestId } from "@/lib/tags/interests";

/**
 * Deterministic tag tally, not a psychometric instrument: each answer maps to one interest,
 * and the quiz result is just "which interests got picked most." No scoring model, no
 * probability — same non-goal as src/lib/matching/match.ts.
 */
export type QuizOption = { id: string; fr: string; en: string; interest: InterestId };
export type QuizQuestion = { id: string; fr: string; en: string; options: QuizOption[] };

export const INTEREST_QUIZ: QuizQuestion[] = [
  {
    id: "friday",
    fr: "Un vendredi soir idéal, tu...",
    en: "An ideal Friday night, you're...",
    options: [
      { id: "fix", fr: "Répares ou bricoles quelque chose", en: "Fixing or building something", interest: "tech_eng" },
      { id: "help", fr: "Aides un proche avec un problème", en: "Helping someone close to you", interest: "health" },
      { id: "debate", fr: "Débats d'un enjeu de société", en: "Debating a social issue", interest: "law_social" },
      { id: "create", fr: "Crées — dessin, musique, vidéo", en: "Creating — drawing, music, video", interest: "arts_comm" },
    ],
  },
  {
    id: "teamwork",
    fr: "Dans un travail d'équipe, tu deviens naturellement...",
    en: "In group work, you naturally become...",
    options: [
      { id: "budget", fr: "Celui qui organise le budget ou le plan", en: "The one who organizes the budget or plan", interest: "business" },
      { id: "explain", fr: "Celui qui explique aux autres", en: "The one who explains things to others", interest: "education" },
      { id: "test", fr: "Celui qui teste si ça marche vraiment", en: "The one who tests if it actually works", interest: "science" },
      { id: "impact", fr: "Celui qui pense à l'impact à long terme", en: "The one who thinks about long-term impact", interest: "environment" },
    ],
  },
  {
    id: "reading",
    fr: "Le sujet qui te garde éveillé à lire un article, c'est...",
    en: "The topic that keeps you reading an article is...",
    options: [
      { id: "tech", fr: "Une nouvelle technologie", en: "A new technology", interest: "tech_eng" },
      { id: "discovery", fr: "Une découverte scientifique", en: "A scientific discovery", interest: "science" },
      { id: "ruling", fr: "Une décision de justice", en: "A court ruling", interest: "law_social" },
      { id: "market", fr: "Une tendance économique", en: "An economic trend", interest: "business" },
    ],
  },
  {
    id: "summerjob",
    fr: "Tu choisirais un emploi d'été...",
    en: "You'd pick a summer job...",
    options: [
      { id: "clinic", fr: "Dans une clinique ou un CPE", en: "At a clinic or daycare", interest: "health" },
      { id: "outdoor", fr: "Sur un projet environnemental", en: "On an environmental project", interest: "environment" },
      { id: "biz", fr: "Dans une entreprise ou un commerce", en: "At a business or shop", interest: "business" },
      { id: "media", fr: "Dans un média ou un événement culturel", en: "At a media outlet or cultural event", interest: "arts_comm" },
    ],
  },
];

export function tallyInterests(picks: InterestId[]): InterestId[] {
  const counts = new Map<InterestId, number>();
  for (const id of picks) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}
