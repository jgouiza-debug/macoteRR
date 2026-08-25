export type CoteRSection = {
  id: string;
  heading: string;
  body: string[]; // paragraphs
};

export type CoteRContent = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  tocTitle: string;
  sections: CoteRSection[];
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export const COTE_R_CONTENT: Record<"fr" | "en", CoteRContent> = {
  fr: {
    metaTitle: "La cote R expliquée — la formule, IDGZ, IFGZ | MaCote",
    metaDescription:
      "Ce qu'est vraiment la cote R, la formule exacte, ce que sont IDGZ et IFGZ, et pourquoi personne en dehors du ministère ne peut calculer la tienne à l'avance.",
    title: "La cote R, expliquée pour de vrai",
    intro:
      "La cote R sert à classer les étudiants de cégep entre eux pour l'admission universitaire contingentée. C'est presque tout ce que les cégeps t'en disent. Voici le reste : la formule exacte, ce que sont IDGZ et IFGZ, et pourquoi aucun outil — y compris celui-ci — ne peut calculer la tienne à l'avance avec certitude.",
    tocTitle: "Sur cette page",
    sections: [
      {
        id: "quest-ce-que",
        heading: "À quoi sert la cote R",
        body: [
          "La cote R (cote de rendement au collégial) transforme tes notes de cégep en une seule valeur comparable entre étudiants de cégeps et de groupes différents. Un 85% en physique à un endroit et un 85% à un autre ne représentent pas la même chose : la cote R existe pour corriger ça.",
          "Les universités québécoises l'utilisent pour les programmes contingentés — ceux avec plus de candidatures que de places — parce que comparer des pourcentages bruts entre des centaines de groupes différents ne serait pas juste. Elle ne mesure pas ton intelligence ni ta valeur. Elle mesure ta position relative dans des groupes précis, à un moment précis.",
        ],
      },
      {
        id: "formule",
        heading: "La formule exacte",
        body: [
          "(Cote Z × IDGZ + IFGZ + 5) × 5",
          "La Cote Z est ta note standardisée dans un cours — ta position par rapport à la moyenne et à l'écart-type de ton propre groupe dans ce cours précis, pas ta note brute. IDGZ et IFGZ sont des indices de force de groupe. C'est ici que ça se complique, et c'est la partie que presque personne n'explique correctement.",
        ],
      },
      {
        id: "idgz-ifgz",
        heading: "Pourquoi personne ne peut la calculer à l'avance",
        body: [
          "IDGZ et IFGZ sont calculés par le BCI (Bureau de coopération interuniversitaire) à partir des cotes Z du secondaire de tous les étudiants inscrits dans ce groupe-cours précis, cette session précise. Ce calcul se fait au niveau du groupe, pas au niveau individuel — et cette donnée n'est tout simplement pas rendue publique. Une réponse du gouvernement du Québec à une demande d'accès à l'information le confirme : seuls le BCI, le ministère et les cégeps (qui reçoivent le résultat final déjà calculé) y ont accès.",
          "Conséquence concrète : aucun outil externe — y compris MaCote — ne peut recalculer ta vraie cote R officielle à partir de zéro, pour une session qui n'est pas encore terminée. C'est exactement pour ça que coter.online, un des calculateurs existants, admet lui-même que IDGZ et IFGZ sont « très difficile à obtenir ». Ce n'est pas une lacune technique qu'un meilleur outil pourrait combler : c'est une donnée qui n'existe tout simplement pas encore tant que la session n'est pas notée, et qui n'est jamais transmise à l'extérieur du ministère même après.",
        ],
      },
      {
        id: "confirmee-vs-estimee",
        heading: "Ce que MaCote fait à la place",
        body: [
          "Ton cégep te communique ta cote R officielle chaque session, via ton portail interne, une fois qu'elle est calculée. MaCote te demande d'entrer ce chiffre confirmé — c'est une donnée réelle, pas une approximation, et elle reste étiquetée « confirmée » dans l'app, jamais mélangée avec une estimation.",
          "Pour projeter une session future, MaCote ne retente pas de recalculer la formule du ministère avec des données qu'il n'a pas. À la place, une fois qu'une cote confirmée existe, l'app calcule une constante de calibration personnelle à partir de cette donnée réelle, puis l'applique à des notes hypothétiques. C'est une approximation de la sensibilité historique de ta propre cote à tes résultats — pas une reproduction du calcul du BCI — et elle devient plus précise à mesure que tu confirmes plusieurs sessions.",
          "Toute projection reste étiquetée « estimation », visuellement distincte d'une cote confirmée, en tout temps.",
        ],
      },
      {
        id: "distribution",
        heading: "Une position, pas un chiffre absolu",
        body: [
          "La cote R n'existe que par rapport à une distribution — ta place dans un groupe, pas une note dans le vide. C'est pour ça que MaCote ne montre jamais un seuil d'admission comme un seul chiffre figé pour l'année en cours : les universités publient des fourchettes sur plusieurs années, ou des minimums, moyennes et maximums, jamais un chiffre unique et actuel. Voir la page Programmes pour le détail de comment ces fourchettes sont construites et sourcées.",
        ],
      },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      {
        q: "Est-ce que MaCote peut calculer ma vraie cote R avant que je la reçoive de mon cégep?",
        a: "Non, et aucun outil externe ne le peut. Deux des trois variables de la formule (IDGZ et IFGZ) sont calculées par le BCI à partir des données de tout ton groupe-cours et ne sont jamais rendues publiques, même après coup. MaCote attend ta cote confirmée par ton cégep, puis calibre ses projections futures à partir de cette donnée réelle.",
      },
      {
        q: "Pourquoi ma cote R change-t-elle si mes notes ne changent pas?",
        a: "Parce qu'elle dépend aussi de la force du groupe dans lequel tu es évalué, pas seulement de ta note brute. Un même résultat peut donner une cote R différente d'une session à l'autre si la composition du groupe change.",
      },
      {
        q: "C'est quoi la différence entre une cote confirmée et une estimation dans MaCote?",
        a: "Une cote confirmée est le chiffre officiel que ton cégep t'a communiqué pour une session terminée. Une estimation est une projection calculée à partir de tes notes actuelles et d'une calibration personnelle — utile pour voir où tu t'en vas, mais jamais garantie.",
      },
      {
        q: "Où puis-je trouver ma cote R officielle?",
        a: "Dans le portail interne de ton cégep (souvent Omnivox), généralement quelques semaines après la fin de chaque session.",
      },
    ],
  },
  en: {
    metaTitle: "The R-score explained — the formula, IDGZ, IFGZ | MaCote",
    metaDescription:
      "What the R-score actually is, the exact formula, what IDGZ and IFGZ are, and why nobody outside the ministry can calculate yours ahead of time.",
    title: "The R-score, actually explained",
    intro:
      "The R-score ranks cégep students against each other for competitive university admission. That's about all your cégep tells you. Here's the rest: the exact formula, what IDGZ and IFGZ are, and why no tool — including this one — can calculate yours ahead of time with certainty.",
    tocTitle: "On this page",
    sections: [
      {
        id: "quest-ce-que",
        heading: "What the R-score is for",
        body: [
          "The R-score (cote de rendement au collégial) turns your cégep grades into a single value comparable across different cégeps and groups. An 85% in physics at one cégep and an 85% at another don't mean the same thing — the R-score exists to correct for that.",
          "Quebec universities use it for limited-enrolment programs — ones with more applicants than seats — because comparing raw percentages across hundreds of different groups wouldn't be fair. It doesn't measure your intelligence or your worth. It measures your relative position within specific groups, at a specific moment.",
        ],
      },
      {
        id: "formule",
        heading: "The exact formula",
        body: [
          "(Cote Z × IDGZ + IFGZ + 5) × 5",
          "Cote Z is your standardized grade in a course — your position relative to your own group's average and standard deviation in that specific course, not your raw grade. IDGZ and IFGZ are group-strength indices. This is where it gets complicated, and it's the part almost nobody explains correctly.",
        ],
      },
      {
        id: "idgz-ifgz",
        heading: "Why nobody can calculate it ahead of time",
        body: [
          "IDGZ and IFGZ are computed by the BCI (Bureau de coopération interuniversitaire) from the high-school Z-scores of every student enrolled in that exact course section, that exact session. This calculation happens at the group level, not the individual level — and it simply isn't public. A Quebec government response to an access-to-information request confirms it: only the BCI, the ministry, and cégeps (who receive the final computed number back) have access to it.",
          "Practical consequence: no outside tool — MaCote included — can recompute your true official R-score from scratch for a session that isn't finished yet. That's exactly why coter.online, one of the existing calculators, admits on its own site that IDGZ and IFGZ are \"très difficile à obtenir.\" This isn't a technical gap a better tool could close: it's data that doesn't exist yet until the session is graded, and is never released outside the ministry even after.",
        ],
      },
      {
        id: "confirmee-vs-estimee",
        heading: "What MaCote does instead",
        body: [
          "Your cégep tells you your official R-score every session, through your internal portal, once it's calculated. MaCote asks you to enter that confirmed number — it's real data, not an approximation, and it stays labeled \"confirmed\" in the app, never blended with an estimate.",
          "To project a future session, MaCote doesn't try to re-derive the ministry's formula from data it doesn't have. Instead, once a confirmed score exists, the app back-solves a personal calibration constant from that real data point, then applies it to hypothetical grades. That's an approximation of how sensitive your own score has historically been to your results — not a reproduction of the BCI's calculation — and it gets more accurate as you confirm more sessions.",
          "Every projection stays labeled \"estimate,\" visually distinct from a confirmed score, at all times.",
        ],
      },
      {
        id: "distribution",
        heading: "A position, not an absolute number",
        body: [
          "An R-score only exists relative to a distribution — your place in a group, not a grade in a vacuum. That's why MaCote never shows an admission cutoff as one fixed current-year number: universities publish multi-year ranges, or minimums, averages and maximums, never a single current figure. See the Programs page for how those ranges are built and sourced.",
        ],
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Can MaCote calculate my real R-score before my cégep gives it to me?",
        a: "No, and no outside tool can. Two of the formula's three variables (IDGZ and IFGZ) are computed by the BCI from your entire course group's data and are never made public, even afterward. MaCote waits for your cégep-confirmed score, then calibrates future projections from that real data point.",
      },
      {
        q: "Why did my R-score change if my grades didn't?",
        a: "Because it also depends on the strength of the group you're being evaluated against, not just your raw grade. The same result can produce a different R-score from one session to another if the group's composition changes.",
      },
      {
        q: "What's the difference between a confirmed score and an estimate in MaCote?",
        a: "A confirmed score is the official number your cégep gave you for a completed session. An estimate is a projection calculated from your current grades and a personal calibration — useful for seeing where you're headed, but never guaranteed.",
      },
      {
        q: "Where do I find my official R-score?",
        a: "In your cégep's internal portal (often Omnivox), usually a few weeks after each session ends.",
      },
    ],
  },
};
