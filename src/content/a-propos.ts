export type AProposSection = {
  id: string;
  heading: string;
  body: string[]; // paragraphs
};

export type AProposContent = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  sections: AProposSection[];
  /** Bordered identity card. `name` and `cegep` are the {founderName} / {founderCegep} SITE_CONFIG
   *  tokens (NEXT_PUBLIC_FOUNDER_NAME / NEXT_PUBLIC_FOUNDER_CEGEP); AProposPage renders a
   *  PendingValue for each, so an unset one shows an "à confirmer" chip, never an invented identity. */
  identity: {
    heading: string;
    name: string;
    cegepLabel: string;
    cegep: string;
    roleLabel: string;
  };
};

export const A_PROPOS_CONTENT: Record<"fr" | "en", AProposContent> = {
  fr: {
    metaTitle: "À propos — qui a fait MaCote et pourquoi | MaCote",
    metaDescription:
      "MaCote est un projet étudiant, pas un outil officiel. Voici qui l'a construit, pourquoi, et ce que l'app ne prétend pas savoir.",
    title: "Qui construit MaCote, et pourquoi",
    intro:
      "MaCote n'est pas fait par une compagnie ni par un cégep. C'est un projet étudiant, construit par une seule personne, parce que l'information sur la cote R était éparpillée et que les outils qui existaient déjà approximaient des données qu'ils n'avaient tout simplement pas.",
    sections: [
      {
        id: "le-probleme",
        heading: "Le problème de départ",
        body: [
          "Ta cote R officielle n'est écrite nulle part au grand complet. Ton cégep te donne le chiffre une fois par session, dans un portail interne, sans grand contexte autour. Le reste — la formule exacte, ce que veulent dire IDGZ et IFGZ, comment lire les fourchettes d'admission d'un programme — est éparpillé entre des PDF de cégep, des présentations données en classe, et le bouche-à-oreille entre étudiants.",
          "Les calculateurs qui existent déjà essaient de deviner ta cote R à l'avance, mais ils approximent des données qu'ils n'ont pas vraiment. coter.online, un des plus connus, admet lui-même sur son site que IDGZ et IFGZ sont « très difficile à obtenir ». MaCote ne prétend pas avoir résolu ce problème-là — la donnée reste hors de portée pour tout le monde en dehors du ministère. L'objectif est plus modeste : être honnête sur ce qui est confirmé et ce qui est estimé, plutôt que de présenter une approximation comme si c'était un fait.",
        ],
      },
      {
        id: "comment-cest-construit",
        heading: "Comment c'est construit",
        body: [
          "Il n'y a pas d'équipe, pas de conseillers, pas d'investisseurs derrière MaCote. Pas de partenariat avec un cégep ou une université non plus — MaCote n'est pas un outil officiel, et il ne se présente jamais comme tel.",
          "Les seuils d'admission et les montants de bourses affichés dans l'app viennent de sources publiques et citées. Rien n'est inventé ni arrondi pour avoir l'air plus précis que ce que les données permettent réellement. Quand un chiffre ne peut pas être confirmé, l'app le dit plutôt que de deviner.",
        ],
      },
    ],
    identity: {
      heading: "Derrière l'app",
      name: "{founderName}",
      cegepLabel: "Cégep",
      cegep: "{founderCegep}",
      roleLabel: "Créateur de MaCote, étudiant de cégep",
    },
  },
  en: {
    metaTitle: "About — who built MaCote and why | MaCote",
    metaDescription:
      "MaCote is a student project, not an official tool. Here's who built it, why, and what the app doesn't claim to know.",
    title: "Who's building MaCote, and why",
    intro:
      "MaCote isn't made by a company or a cégep. It's a student project, built by one person, because information about the R-score was scattered everywhere and the tools that already existed were approximating data they simply didn't have.",
    sections: [
      {
        id: "le-probleme",
        heading: "The starting problem",
        body: [
          "Your official R-score isn't written down in full anywhere. Your cégep gives you the number once a session, in an internal portal, with little context around it. Everything else — the exact formula, what IDGZ and IFGZ mean, how to read a program's admission range — is scattered across cégep PDFs, in-class presentations, and word of mouth between students.",
          "The calculators that already exist try to guess your R-score ahead of time, but they're approximating data they don't actually have. coter.online, one of the better-known ones, admits on its own site that IDGZ and IFGZ are \"très difficile à obtenir\" (very hard to obtain). MaCote doesn't claim to have solved that — the data stays out of reach for everyone outside the ministry. The goal is smaller: be honest about what's confirmed and what's estimated, instead of presenting an approximation as if it were a fact.",
        ],
      },
      {
        id: "comment-cest-construit",
        heading: "How it's built",
        body: [
          "There's no team, no advisors, no investors behind MaCote. No partnership with a cégep or a university either — MaCote isn't an official tool, and it never presents itself as one.",
          "The admission cutoffs and bursary amounts shown in the app come from public, cited sources. Nothing is invented or rounded to look more precise than the underlying data actually allows. When a number can't be confirmed, the app says so instead of guessing.",
        ],
      },
    ],
    identity: {
      heading: "Behind the app",
      name: "{founderName}",
      cegepLabel: "Cégep",
      cegep: "{founderCegep}",
      roleLabel: "Creator of MaCote, cégep student",
    },
  },
};
