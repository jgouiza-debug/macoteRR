export type BoursesSection = {
  id: string;
  heading: string;
  body: string[]; // paragraphs
};

export type BoursesContent = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  /** Uppercase label above the prominent "no financial data" statement box. */
  privacyLabel: string;
  privacyBody: string;
  tocTitle: string;
  sections: BoursesSection[];
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export const BOURSES_CONTENT: Record<"fr" | "en", BoursesContent> = {
  fr: {
    metaTitle: "Bourses de cégep — jumelage sans données financières | MaCote",
    metaDescription:
      "Comment MaCote jumelle les bourses des fondations de cégep à ton profil réel — cégep, programme, session, tags — sans jamais demander ton revenu ou celui de tes parents.",
    title: "Les bourses, expliquées pour de vrai",
    intro:
      "Chaque fondation de cégep gère son propre programme de bourses, avec ses propres critères et ses propres dates limites — souvent sans page claire qui les regroupe. MaCote rassemble ces bourses et ne te montre que celles qui correspondent réellement à ton profil, sans jamais te demander combien tes parents gagnent.",
    privacyLabel: "Ce qu'on ne te demande jamais",
    privacyBody:
      "MaCote ne collecte et ne demande jamais ton revenu, la situation financière de tes parents, ou la taille de ton ménage. Le jumelage de bourses repose uniquement sur ton cégep, ton programme, ta session, et les tags que tu choisis toi-même (sport, bénévolat, arts et culture, et ainsi de suite). Rien de plus.",
    tocTitle: "Sur cette page",
    sections: [
      {
        id: "comment-ca-marche",
        heading: "Comment le jumelage fonctionne",
        body: [
          "Chaque bourse dans MaCote vient d'une fondation de cégep ou d'un programme provincial, comme les bourses de la Fondation du Cégep de Sainte-Foy. MaCote compare les critères de chaque bourse à ton profil — cégep, programme, session, cote R si un seuil est fixé, et tes tags d'activités — et te montre le résultat en trois groupes plutôt qu'une liste unique.",
          "« Jumelées » regroupe les bourses où tu réponds à tous les critères stricts (cégep, programme, session). « Presque » regroupe celles où il te manque seulement un critère souple — ta cote R est à deux points ou moins du seuil, ou tu n'as pas encore ajouté à ton profil le programme universitaire visé par la bourse. « À explorer » regroupe les bourses ouvertes à tous, comme les programmes provinciaux, toujours affichées comme point de départ.",
          "Tes tags d'activités (sport, bénévolat, leadership, et ainsi de suite) ne t'excluent jamais d'une bourse — ils l'ajoutent comme signal positif quand il y a une correspondance. Si tu as oublié de te taguer « bénévolat », tu vois quand même les bourses qui le demandent, tu ne perds simplement pas ce signal de correspondance.",
        ],
      },
      {
        id: "categories",
        heading: "Des exemples réels, pas des catégories abstraites",
        body: [
          "Les bourses de fondations de cégep couvrent généralement trois types de critères. Le mérite académique, comme la Bourse d'excellence en sciences de la nature de la Fondation du Cégep de Sainte-Foy, ouverte aux étudiants de ce programme avec une cote R de 27 et plus. L'engagement communautaire, comme la Bourse d'implication communautaire Desjardins de la même fondation, jumelée à tes tags « bénévolat » ou « engagement communautaire ». Et la persévérance scolaire, comme la Bourse de persévérance scolaire, réservée aux étudiants rendus à leur deuxième session et plus.",
          "À côté des bourses de fondation, MaCote affiche aussi des programmes provinciaux ouverts à tous, comme le Programme de prêts et bourses de l'Aide financière aux études du gouvernement du Québec — sans critère de cégep ni de programme, toujours dans le groupe « à explorer ».",
        ],
      },
      {
        id: "candidature",
        heading: "Comment tu poses réellement ta candidature",
        body: [
          "MaCote ne remplit jamais un formulaire de bourse à ta place et n'héberge aucune candidature. Chaque bourse jumelée pointe vers le lien de candidature réel de la fondation, quand il existe. Quand une fondation ne publie pas de formulaire en ligne — c'est le cas de la Bourse de persévérance scolaire, qui passe par une recommandation interne — MaCote te le dit clairement plutôt que d'afficher un lien mort.",
          "Chaque bourse affiche aussi la date à laquelle son information a été vérifiée pour la dernière fois, la même exigence que MaCote applique aux cotes de coupure des programmes universitaires.",
        ],
      },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      {
        q: "Est-ce que MaCote me demande le revenu de mes parents pour me montrer des bourses?",
        a: "Non, jamais. Le jumelage utilise seulement ton cégep, ton programme, ta session et tes tags d'activités choisis toi-même. Certaines bourses individuelles peuvent exiger une preuve de besoin financier une fois que tu postules directement auprès de la fondation — mais ça se passe entièrement sur le formulaire de la fondation, jamais dans MaCote.",
      },
      {
        q: "Qu'est-ce que ça change qu'une bourse soit « Jumelée » plutôt que « Presque »?",
        a: "« Jumelée » veut dire que tu réponds à tous les critères stricts de la bourse. « Presque » veut dire qu'il te manque seulement un critère souple — souvent ta cote R est à deux points ou moins du seuil demandé, ou tu n'as pas encore ajouté le programme universitaire visé à ton profil. Dans les deux cas, ça vaut la peine de vérifier les critères complets sur le site de la fondation.",
      },
      {
        q: "Pourquoi une bourse ne montre pas de montant ou de date limite?",
        a: "Certaines fondations ne publient pas ces détails publiquement, ou les communiquent seulement aux étudiants qui postulent directement. MaCote n'invente jamais un montant ou une date — quand l'information n'est pas disponible, la bourse l'indique plutôt que d'afficher un chiffre inventé.",
      },
      {
        q: "Est-ce que je peux poser ma candidature directement dans MaCote?",
        a: "Non. MaCote t'aide à trouver les bourses pertinentes et te dirige vers le vrai formulaire de la fondation — ou vers ton cégep, quand la bourse n'a pas de formulaire public. La candidature elle-même se passe toujours du côté de la fondation.",
      },
    ],
  },
  en: {
    metaTitle: "Cégep bursaries — matched without financial data | MaCote",
    metaDescription:
      "How MaCote matches cégep foundation bursaries to your real profile — cégep, program, session, tags — without ever asking for your income or your parents'.",
    title: "Bursaries, actually explained",
    intro:
      "Every cégep foundation runs its own bursary program, with its own criteria and its own deadlines — usually with no single page that pulls them together. MaCote gathers those bursaries and only shows you the ones that actually match your profile, without ever asking what your parents make.",
    privacyLabel: "What we never ask for",
    privacyBody:
      "MaCote never collects or asks for your income, your parents' financial situation, or your household size. Bursary matching runs only on your cégep, your program, your session, and the tags you choose yourself (sports, volunteering, arts and culture, and so on). Nothing else.",
    tocTitle: "On this page",
    sections: [
      {
        id: "comment-ca-marche",
        heading: "How matching actually works",
        body: [
          "Every bursary in MaCote comes from a cégep foundation or a provincial program, like the bursaries run by the Cégep de Sainte-Foy Foundation. MaCote checks each bursary's criteria against your profile — cégep, program, session, R-score if a threshold applies, and your activity tags — and sorts the result into three groups instead of one flat list.",
          "\"Matched\" covers bursaries where you meet every strict requirement (cégep, program, session). \"Close\" covers ones where you're only missing a soft requirement — your R-score is within two points of the threshold, or you haven't added the bursary's target university program to your profile yet. \"Explore\" covers bursaries open to everyone, like provincial programs, always shown as a starting point.",
          "Your activity tags (sports, volunteering, leadership, and so on) never exclude you from a bursary — they only add a positive signal when there's a match. If you forgot to tag \"volunteering,\" you still see bursaries that ask for it; you just don't get that extra match signal.",
        ],
      },
      {
        id: "categories",
        heading: "Real examples, not abstract categories",
        body: [
          "Cégep foundation bursaries generally fall into three kinds of criteria. Academic merit, like the Cégep de Sainte-Foy Foundation's Sciences de la nature excellence bursary, open to students in that program with an R-score of 27 or higher. Community involvement, like the same foundation's Desjardins Community Involvement Bursary, matched against your \"volunteering\" or \"community engagement\" tags. And perseverance, like the Perseverance Bursary, reserved for students who've reached their second session or later.",
          "Alongside foundation bursaries, MaCote also shows province-wide programs open to everyone, like the Quebec government's AFE student loans and bursaries program — no cégep or program requirement, always sitting in the \"explore\" group.",
        ],
      },
      {
        id: "candidature",
        heading: "How you actually apply",
        body: [
          "MaCote never fills out a bursary application for you and never hosts an application itself. Every matched bursary links to the foundation's real application page, when one exists. When a foundation doesn't publish an online form — like the Perseverance Bursary, which runs through an internal recommendation instead — MaCote says so plainly rather than showing a dead link.",
          "Every bursary also shows the date its information was last verified — the same standard MaCote applies to university admission cutoffs.",
        ],
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Does MaCote ask for my parents' income to show me bursaries?",
        a: "No, never. Matching only uses your cégep, program, session, and the activity tags you choose yourself. Some individual bursaries may require proof of financial need once you apply directly through the foundation — but that happens entirely on the foundation's own form, never inside MaCote.",
      },
      {
        q: "What's the actual difference between a \"Matched\" bursary and a \"Close\" one?",
        a: "\"Matched\" means you meet every strict requirement for that bursary. \"Close\" means you're missing only a soft one — usually your R-score is within two points of the threshold, or you haven't added the target university program to your profile yet. Either way, it's worth checking the full criteria on the foundation's site.",
      },
      {
        q: "Why does a bursary not show an amount or a deadline?",
        a: "Some foundations don't publish those details publicly, or only share them with students who apply directly. MaCote never invents an amount or a date — when the information isn't available, the bursary says so instead of showing a made-up figure.",
      },
      {
        q: "Can I actually apply through MaCote?",
        a: "No. MaCote helps you find the relevant bursaries and points you to the foundation's real form — or to your cégep, when a bursary has no public form. The application itself always happens on the foundation's side.",
      },
    ],
  },
};
