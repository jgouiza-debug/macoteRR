// DRAFT — see LEGAL-REVIEW-NOTES.md at the repo root. Not legal advice.

import type { LegalSection } from "./confidentialite";

export type TermsContent = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lastUpdated: string;
  summaryTitle: string;
  summaryPoints: string[];
  sections: LegalSection[];
};

export const TERMS_CONTENT: Record<"fr" | "en", TermsContent> = {
  fr: {
    metaTitle: "Conditions d'utilisation | MaCote",
    metaDescription: "Ce que MaCote peut et ne peut pas garantir sur les données qu'il affiche.",
    title: "Conditions d'utilisation",
    lastUpdated: "Dernière mise à jour : 24 août 2026 (brouillon)",
    summaryTitle: "En bref",
    summaryPoints: [
      "MaCote est gratuit et n'affiche jamais un seuil d'admission comme un chiffre unique et actuel — les universités publient des fourchettes sur plusieurs années, jamais un chiffre garanti pour l'année en cours.",
      "Les seuils, préalables et montants de bourses sont compilés à partir de sources publiques, ne sont pas officiels, et peuvent avoir plusieurs années de retard sur le cycle d'admission en cours.",
      "Confirme toujours l'information avec ton propre cégep, le portail SRAM, ou l'université visée avant de prendre une décision.",
      "Tu peux fermer ton compte en tout temps; voir la Politique de confidentialité pour la suppression de tes données.",
    ],
    sections: [
      {
        heading: "Ce que MaCote est",
        body: [
          "MaCote est un outil gratuit qui t'aide à suivre ta cote R, à voir ce que des programmes universitaires exigent, et à trouver des bourses de la fondation de ton cégep auxquelles tu pourrais être admissible. Ce n'est pas un service gouvernemental, pas un service de ton cégep, et pas un conseiller académique ou financier.",
        ],
      },
      {
        heading: "Exactitude des données : ce que tu dois savoir",
        body: [
          "Les seuils de programme, préalables et montants de bourses affichés dans MaCote sont compilés à partir de sources publiques (sites des universités, documents PDF publiés par les cégeps et le BCI). Cette information n'est pas officielle et n'est pas garantie exacte ou à jour.",
          "Les universités publient rarement un seuil « actuel » : elles publient des fourchettes sur plusieurs années, ou des minimums, moyennes et maximums d'admission passée — et ces chiffres les plus récents accusent souvent un retard de deux à six ans sur le cycle d'admission en cours. MaCote ne présente donc jamais un seuil comme s'il s'agissait d'un chiffre garanti pour l'année en cours; chaque chiffre affiché porte son année et son type précis.",
          "Ta cote R confirmée dans MaCote est celle que tu as toi-même entrée après l'avoir reçue de ton cégep — MaCote ne peut pas calculer ta cote R officielle avant que ton cégep te la communique (voir la page La cote R pour l'explication complète). Toute projection affichée avant ce moment est clairement étiquetée comme une estimation, jamais comme un chiffre officiel.",
          "Avant de prendre une décision d'admission, de cours ou de candidature à une bourse, confirme toujours l'information avec ton cégep, le portail SRAM, ou directement avec l'université ou la fondation concernée.",
        ],
      },
      {
        heading: "Ton compte",
        body: [
          "Tu n'as pas besoin d'un compte pour utiliser les fonctions de base de MaCote. Un compte te permet de garder ton historique d'une session à l'autre. Tu peux fermer ton compte et demander la suppression de tes données en tout temps — voir la Politique de confidentialité.",
        ],
      },
      {
        heading: "Aucune garantie",
        body: [
          "MaCote est fourni « tel quel », sans garantie d'exactitude, de disponibilité continue ou d'adéquation à un usage particulier. MaCote n'est pas responsable des décisions prises à partir de l'information affichée — vérifie toujours auprès de la source officielle avant d'agir.",
        ],
      },
      {
        heading: "Droit applicable",
        body: ["Ces conditions sont régies par les lois applicables au Québec, Canada."],
      },
    ],
  },
  en: {
    metaTitle: "Terms of Use | MaCote",
    metaDescription: "What MaCote can and can't guarantee about the data it shows.",
    title: "Terms of Use",
    lastUpdated: "Last updated: August 24, 2026 (draft)",
    summaryTitle: "In short",
    summaryPoints: [
      "MaCote is free and never shows an admission cutoff as a single, current-year number — universities publish multi-year ranges, never a guaranteed figure for the current cycle.",
      "Cutoffs, prerequisites, and bursary amounts are compiled from public sources, are unofficial, and can lag the current admission cycle by several years.",
      "Always confirm information with your own cégep, the SRAM portal, or the target university before making a decision.",
      "You can close your account at any time; see the Privacy Policy for data deletion.",
    ],
    sections: [
      {
        heading: "What MaCote is",
        body: [
          "MaCote is a free tool that helps you track your R-score, see what university programs actually require, and find bursaries from your cégep's foundation you might qualify for. It is not a government service, not a service of your cégep, and not an academic or financial advisor.",
        ],
      },
      {
        heading: "Data accuracy: what you need to know",
        body: [
          "Program cutoffs, prerequisites, and bursary amounts shown in MaCote are compiled from public sources (university websites, PDF documents published by cégeps and the BCI). This information is unofficial and not guaranteed to be accurate or current.",
          "Universities rarely publish a single \"current\" cutoff: they publish multi-year ranges, or minimums, averages, and maximums from past admission cycles — and the freshest such figures often run two to six years behind the current admission cycle. MaCote therefore never presents a cutoff as if it were a guaranteed current-year number; every figure shown carries its own year and specific type.",
          "Your confirmed R-score in MaCote is the one you entered yourself after receiving it from your cégep — MaCote cannot calculate your official R-score before your cégep provides it (see the R-score page for the full explanation). Any projection shown before that point is clearly labeled as an estimate, never as an official number.",
          "Before making an admission, course, or bursary-application decision, always confirm information with your cégep, the SRAM portal, or directly with the relevant university or foundation.",
        ],
      },
      {
        heading: "Your account",
        body: [
          "You don't need an account to use MaCote's core features. An account lets you keep your history from session to session. You can close your account and request deletion of your data at any time — see the Privacy Policy.",
        ],
      },
      {
        heading: "No warranty",
        body: [
          "MaCote is provided \"as is,\" with no warranty of accuracy, continuous availability, or fitness for a particular purpose. MaCote is not responsible for decisions made based on the information shown — always verify with the official source before acting.",
        ],
      },
      {
        heading: "Governing law",
        body: ["These terms are governed by the laws applicable in Quebec, Canada."],
      },
    ],
  },
};
