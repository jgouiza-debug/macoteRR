export type PourLesCegepsSection = {
  id: string;
  heading: string;
  body: string[]; // paragraphs
};

export type PourLesCegepsPilot = {
  id: string;
  heading: string;
  intro: string;
  points: string[];
};

export type PourLesCegepsContactLabels = {
  id: string;
  heading: string;
  intro: string;
  nameLabel: string;
  namePlaceholder: string;
  institutionLabel: string;
  institutionPlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  subjectPrefix: string;
  note: string;
  /** Shown under the form while SITE_CONFIG.pilotEmail is unset — no mailto: can be built then. */
  pendingAddressNote: string;
};

export type PourLesCegepsContent = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  sections: PourLesCegepsSection[];
  pilot: PourLesCegepsPilot;
  contact: PourLesCegepsContactLabels;
};

export const POUR_LES_CEGEPS_CONTENT: Record<"fr" | "en", PourLesCegepsContent> = {
  fr: {
    metaTitle: "MaCote pour les cégeps — l'export de préparation pour conseillers | MaCote",
    metaDescription:
      "Comment l'export de préparation de MaCote donne aux conseillers d'orientation un résumé d'une page — cote R, programmes ciblés, risques — avant une rencontre, et à quoi ressemblerait un projet pilote avec votre cégep.",
    title: "MaCote pour les cégeps",
    intro:
      "Les conseillers et conseillères d'orientation suivent un grand nombre d'étudiants à la fois, chacun avec sa propre cote R, ses propres programmes ciblés et ses propres échéances de bourses. Cette page décrit ce que MaCote peut apporter à une rencontre, sans remplacer votre jugement professionnel, et comment amorcer un projet pilote avec votre cégep.",
    sections: [
      {
        id: "charge-de-travail",
        heading: "La pression sur les services d'orientation",
        body: [
          "Un dossier étudiant comporte plusieurs éléments qui évoluent en parallèle : la cote R change de session en session, les seuils publiés par les programmes ciblés changent d'une année à l'autre, et les bourses ont chacune leur propre date limite. Reconstituer cet état des lieux dossier par dossier, avant chaque rencontre, prend du temps qu'un service aux étudiants n'a pas toujours en excédent.",
          "MaCote a été conçu du point de vue de l'étudiant, pas comme un outil institutionnel : il n'y a pas de compte conseiller, pas de tableau de bord de cohorte, pas d'accès à des dossiers que l'étudiant n'a pas choisi de partager. Ce que l'étudiant y consigne peut toutefois servir de point de départ concret à une rencontre, plutôt que de repartir d'une feuille blanche à chaque fois.",
        ],
      },
      {
        id: "export-conseiller",
        heading: "Ce que contient l'export de préparation",
        body: [
          "Avant une rencontre, un·e étudiant·e peut générer depuis MaCote un résumé imprimable d'une page, pensé pour être apporté tel quel. Le document reprend l'historique de sa cote R telle qu'il ou elle l'a saisie — les sessions confirmées par le cégep et l'estimation de la session en cours — ainsi que les programmes universitaires ciblés, avec les cotes publiées par ces programmes (une fourchette, un minimum, une moyenne ou un maximum, selon ce que l'université rend public, chaque chiffre daté et sourcé) et sa position par rapport à cette fourchette.",
          "Une dernière section signale les points qui méritent d'être discutés en rencontre : un préalable pas encore complété, ou un seuil minimal dans un cours précis qu'exigent certains programmes et que l'étudiant·e n'a pas encore atteint. Le document précise explicitement qu'il s'agit d'une estimation non officielle, construite à partir de données saisies par l'étudiant·e, et qu'il vient en appui à une rencontre — jamais en remplacement d'un avis professionnel.",
        ],
      },
    ],
    pilot: {
      id: "projet-pilote",
      heading: "À quoi ressemblerait un projet pilote",
      intro:
        "Un projet pilote avec un cégep prendrait la forme d'une période d'essai simple, pendant laquelle un nombre limité de conseillers ou conseillères utiliseraient l'export de préparation avec les étudiants qui le souhaitent.",
      points: [
        "Une période d'essai courte, sans engagement à long terme",
        "Aucun coût, ni pour le cégep ni pour les étudiants",
        "Aucune donnée financière étudiante impliquée, à aucun moment",
        "Une participation opt-in, décidée individuellement par chaque étudiant·e",
      ],
    },
    contact: {
      id: "contact",
      heading: "Nous joindre",
      intro:
        "Vous faites partie des services aux étudiants d'un cégep et souhaitez en discuter? Remplissez les champs ci-dessous.",
      nameLabel: "Nom",
      namePlaceholder: "Votre nom",
      institutionLabel: "Cégep ou établissement",
      institutionPlaceholder: "Cégep de...",
      emailLabel: "Courriel",
      emailPlaceholder: "vous@cegep.qc.ca",
      messageLabel: "Message",
      messagePlaceholder: "Où en sont vos besoins ou vos questions?",
      submitLabel: "Envoyer par courriel",
      subjectPrefix: "Projet pilote —",
      note: "Ce formulaire ouvre votre logiciel de courriel habituel avec un message prérempli; rien n'est transmis automatiquement depuis cette page.",
      pendingAddressNote: "Adresse de contact à confirmer avant le lancement.",
    },
  },
  en: {
    metaTitle: "MaCote for cégeps — the counselor-prep export | MaCote",
    metaDescription:
      "How MaCote's counselor-prep export gives academic counselors a one-page summary — R-score, targeted programs, risks — before a meeting, and what a pilot with your cégep would look like.",
    title: "MaCote for cégeps",
    intro:
      "Academic counselors track a large number of students at once, each with their own R-score, targeted programs, and bursary deadlines. This page describes what MaCote can bring to a meeting, without replacing your professional judgment, and how to start a pilot with your cégep.",
    sections: [
      {
        id: "charge-de-travail",
        heading: "The pressure on student services",
        body: [
          "A student file has several parts moving at once: the R-score changes session to session, the cutoffs published by targeted programs shift year to year, and every bursary carries its own deadline. Rebuilding that picture file by file, before each meeting, takes time a student services office doesn't always have to spare.",
          "MaCote was built from the student's point of view, not as an institutional tool: there's no counselor account, no cohort dashboard, no access to files a student hasn't chosen to share. What a student enters can still serve as a concrete starting point for a meeting, instead of starting from a blank page every time.",
        ],
      },
      {
        id: "export-conseiller",
        heading: "What the counselor-prep export contains",
        body: [
          "Before a meeting, a student can generate a printable, one-page summary from MaCote, meant to be brought as-is. The document carries the R-score history as the student entered it — sessions confirmed by their cégep, plus an estimate for the current session — along with the university programs they're targeting, the cutoffs those programs have published (a range, a minimum, an average, or a maximum, depending on what the university makes public, each figure dated and sourced), and where the student's score sits relative to that range.",
          "A final section flags what's worth discussing in the meeting: a prerequisite not yet completed, or a minimum grade in one specific course that some programs require and the student hasn't yet met. The document states plainly that it's an unofficial estimate, built from data the student entered, and that it supports a meeting — it never substitutes for professional advice.",
        ],
      },
    ],
    pilot: {
      id: "projet-pilote",
      heading: "What a pilot would look like",
      intro:
        "A pilot with a cégep would take the shape of a simple trial period, during which a limited number of counselors would use the prep export with the students who want to.",
      points: [
        "A short trial period, with no long-term commitment",
        "No cost, for the cégep or for students",
        "No student financial data involved, at any point",
        "Opt-in participation, decided individually by each student",
      ],
    },
    contact: {
      id: "contact",
      heading: "Get in touch",
      intro:
        "Part of a cégep's student services team and want to talk it through? Fill in the fields below.",
      nameLabel: "Name",
      namePlaceholder: "Your name",
      institutionLabel: "Cégep or institution",
      institutionPlaceholder: "Your cégep",
      emailLabel: "Email",
      emailPlaceholder: "you@cegep.qc.ca",
      messageLabel: "Message",
      messagePlaceholder: "Where things stand, or what you'd like to know.",
      submitLabel: "Send by email",
      subjectPrefix: "Pilot program —",
      note: "This form opens your usual email client with a pre-filled message; nothing is sent automatically from this page.",
      pendingAddressNote: "Contact address to be confirmed before launch.",
    },
  },
};
