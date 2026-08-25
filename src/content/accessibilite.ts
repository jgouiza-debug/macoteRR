// DRAFT — the full site-wide accessibility verification pass (contrast table, keyboard
// walkthrough, 200% zoom check) hasn't run yet as of this writing. This statement will be
// finalized once that pass completes; see LEGAL-REVIEW-NOTES.md.

import type { LegalSection } from "./confidentialite";

export type AccessibilityContent = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lastUpdated: string;
  summaryTitle: string;
  summaryPoints: string[];
  sections: LegalSection[];
};

export const ACCESSIBILITY_CONTENT: Record<"fr" | "en", AccessibilityContent> = {
  fr: {
    metaTitle: "Accessibilité | MaCote",
    metaDescription: "Notre cible d'accessibilité, ce qui reste à vérifier, et comment signaler un problème.",
    title: "Accessibilité",
    lastUpdated: "Dernière mise à jour : 24 août 2026 (brouillon)",
    summaryTitle: "En bref",
    summaryPoints: [
      "Notre cible est le niveau AA des Web Content Accessibility Guidelines (WCAG) 2.2.",
      "Une vérification complète (contraste des couleurs, navigation au clavier, zoom à 200%) est en cours et n'est pas encore terminée sur toutes les pages — voir la liste des lacunes connues ci-dessous.",
      "Tu peux signaler un problème d'accessibilité en tout temps — voir Contact.",
    ],
    sections: [
      {
        heading: "Notre cible",
        body: [
          "MaCote vise la conformité au niveau AA des Web Content Accessibility Guidelines (WCAG) 2.2 : contraste des couleurs suffisant, navigation complète au clavier avec un indicateur de focus visible en tout temps, structure sémantique réelle (un seul titre principal par page, niveaux de titres ordonnés), et un lien pour aller directement au contenu principal.",
        ],
      },
      {
        heading: "Lacunes connues",
        body: [
          "Une vérification systématique du contraste de chaque paire texte/fond, de la navigation au clavier complète, et de l'affichage à 200% de zoom est en cours sur l'ensemble du site au moment d'écrire ces lignes. Cette section sera mise à jour avec la liste précise des lacunes trouvées et corrigées, plutôt que de prétendre qu'aucune lacune n'existe avant que cette vérification soit terminée.",
        ],
      },
      {
        heading: "Signaler un problème",
        body: [
          "Si tu rencontres un obstacle à l'accessibilité sur MaCote, écris-nous à [courriel de contact — voir Contact]. Décris la page et ce qui ne fonctionne pas (par exemple : un élément inatteignable au clavier, un contraste insuffisant, un lecteur d'écran qui ne lit pas correctement un élément) — ça nous aide à corriger le problème plus vite.",
        ],
      },
    ],
  },
  en: {
    metaTitle: "Accessibility | MaCote",
    metaDescription: "Our accessibility target, what's still being checked, and how to report an issue.",
    title: "Accessibility",
    lastUpdated: "Last updated: August 24, 2026 (draft)",
    summaryTitle: "In short",
    summaryPoints: [
      "Our target is WCAG (Web Content Accessibility Guidelines) 2.2 level AA.",
      "A full verification pass (color contrast, keyboard navigation, 200% zoom) is underway and not yet complete across every page — see the known gaps below.",
      "You can report an accessibility issue at any time — see Contact.",
    ],
    sections: [
      {
        heading: "Our target",
        body: [
          "MaCote targets WCAG (Web Content Accessibility Guidelines) 2.2 level AA conformance: sufficient color contrast, full keyboard navigation with a visible focus indicator at all times, real semantic structure (one main heading per page, ordered heading levels), and a skip link straight to the main content.",
        ],
      },
      {
        heading: "Known gaps",
        body: [
          "A systematic check of every text/background contrast pairing, full keyboard navigation, and 200% zoom display is underway across the site as of this writing. This section will be updated with the exact list of gaps found and fixed, rather than claiming none exist before that verification is complete.",
        ],
      },
      {
        heading: "Report an issue",
        body: [
          "If you run into an accessibility barrier on MaCote, write to us at [contact email — see Contact]. Describe the page and what isn't working (e.g. an element you can't reach by keyboard, insufficient contrast, a screen reader not reading something correctly) — it helps us fix it faster.",
        ],
      },
    ],
  },
};
