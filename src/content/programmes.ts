export type ProgrammesSection = {
  id: string;
  heading: string;
  body: string[]; // paragraphs
};

/**
 * The illustrative mockup card standing in for a screenshot. Every value here is real,
 * pulled from src/lib/sample-data.ts (UNIVERSITY_PROGRAMS' udem-droit entry and
 * DASHBOARD_SAMPLE's paired goalProgram/currentEstimate) — only the pairing of "here's an
 * example row" is illustrative, not the underlying figures. See src/lib/rscore/cutoff-range.ts
 * for how the range and status are actually derived from those figures.
 */
export type ProgrammesMockup = {
  label: string;
  programName: string;
  institution: string;
  rangeLabel: string;
  rangeCaption: string;
  scoreCaption: string;
  statusLabel: string;
};

export type ProgrammesContent = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  intro: string;
  mockup: ProgrammesMockup;
  tocTitle: string;
  sections: ProgrammesSection[];
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export const PROGRAMMES_CONTENT: Record<"fr" | "en", ProgrammesContent> = {
  fr: {
    metaTitle: "Programmes : fourchettes de cote R et préalables | MaCote",
    metaDescription:
      "Comment MaCote lit les seuils d'admission par programme : des fourchettes publiées sur plusieurs années, le suivi des préalables, et le seuil par cours quand il existe.",
    title: "Les programmes, au-delà d'un seul chiffre",
    intro:
      "Un programme contingenté ne se résume jamais à « la cote R pour entrer est X. » MaCote rassemble ce que chaque programme publie réellement — des fourchettes sur plusieurs années, tes préalables, et parfois un seuil minimal dans un cours précis — puis compare ta cote à l'ensemble. Voici comment chaque pièce fonctionne, et ce que ça veut dire pour toi aujourd'hui.",
    mockup: {
      label: "Exemple illustratif — pas une capture d'écran de l'app",
      programName: "Droit",
      institution: "Université de Montréal",
      rangeLabel: "31,5 – 38,1",
      rangeCaption: "Cégeps, 2024 (dernier·ère admis·e à maximum)",
      scoreCaption: "Cote R estimée : 32,41",
      statusLabel: "Dans la fourchette",
    },
    tocTitle: "Sur cette page",
    sections: [
      {
        id: "fourchettes",
        heading: "Des fourchettes, jamais un chiffre unique",
        body: [
          "Une université ne publie presque jamais « le seuil pour entrer cette année est X. » Elle publie un ou plusieurs types de chiffres — la cote de la dernière personne admise, un minimum requis, un maximum, une moyenne, ou le bas et le haut d'une fourchette — chacun daté à une année et une cohorte précises. MaCote reprend cet ensemble tel quel : chaque figure garde son année, son type, et si elle vient directement de l'université ou d'une compilation de cégep.",
          "Quand une université publie ses propres chiffres, MaCote les préfère toujours à une compilation de cégep pour le même programme — c'est la source la plus proche du décompte réel. Le Droit à l'Université de Montréal en est un bon exemple : les trois figures publiées pour la cohorte 2024 (dernier·ère admis·e à 31,5, moyenne à 33,2, maximum à 38,1) donnent une fourchette de 31,5 à 38,1 — pas un chiffre, une plage. C'est exactement ce que montre l'encadré ci-dessus.",
        ],
      },
      {
        id: "prealables",
        heading: "Le suivi des préalables, programme par programme",
        body: [
          "Chaque programme universitaire liste ses propres cours préalables, et MaCote suit chacun individuellement selon trois états : acquis, manquant, ou en cours. Le BAA de HEC Montréal, par exemple, exige Calcul différentiel, Calcul intégral et Algèbre linéaire — trois préalables distincts, pas un bloc unique « mathématiques ».",
          "C'est une vérification séparée de la cote R elle-même. Ta cote peut être dans la fourchette d'un programme et il peut quand même te manquer un préalable — ce sont deux questions différentes, et une fourchette de cote R ne répond qu'à la première.",
        ],
      },
      {
        id: "seuil-par-cours",
        heading: "Le seuil par cours, à part de la fourchette du programme",
        body: [
          "Un programme peut exiger, en plus de sa fourchette globale, une note minimale dans un cours précis — un seuil par cours, distinct de la cote R d'ensemble. C'est un type d'exigence réel, pas une variante de la fourchette : tu peux être dans la fourchette du programme et ne pas atteindre ce minimum dans le cours visé, ou l'inverse. La plupart des calculateurs de cote R ne suivent que le chiffre global et ne montrent jamais cette deuxième exigence.",
          "Aucun des programmes actuellement vérifiés dans MaCote n'a de seuil par cours confirmé pour l'instant — le champ existe dans notre modèle de données et reste vide plutôt que d'afficher une estimation, exactement comme pour tout autre chiffre que nous n'avons pas pu sourcer. S'il s'en confirme un, il apparaîtra à côté de la fourchette du programme concerné, jamais fondu dedans.",
        ],
      },
      {
        id: "lookup-inverse",
        heading: "Le lookup inversé : où tu te situes aujourd'hui",
        body: [
          "Une fois que tu as une cote R — confirmée par ton cégep ou estimée par MaCote — l'app la compare à la fourchette de chaque programme et lui donne un statut parmi quatre : au-dessus, dans la fourchette, en dessous, ou pas encore vérifié. Ce dernier statut ne veut pas dire « en dessous » : il veut dire que MaCote n'a tout simplement aucune fourchette publiée à comparer pour ce programme-là.",
          "Dans l'encadré plus haut, une cote estimée de 32,41 tombe entre 31,5 et 38,1 pour le Droit à l'UdeM : elle est marquée « dans la fourchette ». Ce n'est pas une garantie d'admission — seulement ta position par rapport à ce qui a été publié pour d'autres cohortes. Une fourchette basée sur 2024 ne fixe rien pour la cohorte de cette année.",
        ],
      },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      {
        q: "Pourquoi MaCote ne me donne pas juste LA cote R minimale pour un programme?",
        a: "Parce que ce chiffre n'existe pas de la façon dont on l'imagine. Les universités publient des types de figures différents — dernier·ère admis·e, minimum requis, maximum, moyenne, ou une fourchette basse/haute — chacune datée à une année précise, jamais une seule valeur garantie pour l'année en cours.",
      },
      {
        q: "Quelle est la différence entre le seuil par cours et la fourchette du programme?",
        a: "La fourchette du programme reflète ta position globale en cote R. Le seuil par cours, quand il existe, est une note minimale exigée dans un cours précis, en plus de la fourchette — pas à sa place. Un programme peut avoir l'un, l'autre, les deux, ou aucun des deux.",
      },
      {
        q: "Que veut dire « pas encore vérifié » dans le lookup inversé?",
        a: "Que MaCote n'a aucune fourchette publiée pour ce programme au dossier — pas que ta cote est insuffisante. C'est différent de « en dessous », qui veut dire qu'une fourchette existe et que ta cote est sous son minimum.",
      },
      {
        q: "D'où viennent les données de programmes de MaCote?",
        a: "Des pages de statistiques d'admission publiées directement par les universités quand elles existent, et de compilations de cégep basées sur les données SRAM sinon. Chaque figure garde sa date de vérification et sa source; quand les deux existent pour un même programme, MaCote privilégie toujours le chiffre publié par l'université.",
      },
    ],
  },
  en: {
    metaTitle: "Programs: R-score ranges and prerequisites | MaCote",
    metaDescription:
      "How MaCote reads admission cutoffs by program: multi-year published ranges, prerequisite tracking, and per-course floors when they exist.",
    title: "Programs, beyond a single number",
    intro:
      "A limited-enrolment program is never just \"the cutoff to get in is X.\" MaCote pulls together what each program actually publishes — multi-year ranges, your prerequisites, and sometimes a minimum grade in one specific course — then checks your score against all of it at once. Here's how each piece works, and what it means for you today.",
    mockup: {
      label: "Illustrative example — not a screenshot of the app",
      programName: "Law",
      institution: "Université de Montréal",
      rangeLabel: "31.5 – 38.1",
      rangeCaption: "Cégep basis, 2024 (last admitted to maximum)",
      scoreCaption: "Estimated R-score: 32.41",
      statusLabel: "Within range",
    },
    tocTitle: "On this page",
    sections: [
      {
        id: "fourchettes",
        heading: "Ranges, never a single number",
        body: [
          "A university almost never publishes \"the cutoff to get in this year is X.\" It publishes one or more figure types instead — the last-admitted score, a minimum required, a maximum, an average, or the low and high ends of a range — each tied to a specific year and cohort. MaCote keeps that structure intact: every figure keeps its year, its type, and whether it came straight from the university or from a cégep-compiled source.",
          "When a university publishes its own numbers, MaCote always prefers them over a cégep-compiled figure for the same program — it's the closer source to the actual count. Law at Université de Montréal is a good example: the three figures published for the 2024 cohort (last admitted at 31.5, average at 33.2, maximum at 38.1) produce a range of 31.5 to 38.1 — not a number, a spread. That's exactly what the box above shows.",
        ],
      },
      {
        id: "prealables",
        heading: "Prerequisite tracking, program by program",
        body: [
          "Every university program lists its own prerequisite courses, and MaCote tracks each one individually across three states: met, missing, or in progress. HEC Montréal's BAA, for instance, requires Calculus I, Calculus II, and Linear Algebra — three separate prerequisites, not one combined \"math\" checkbox.",
          "That's a separate check from the R-score comparison itself. Your score can sit inside a program's range and you can still be missing a prerequisite — those are two different questions, and a cutoff range only answers the first one.",
        ],
      },
      {
        id: "seuil-par-cours",
        heading: "The per-course floor, separate from the program range",
        body: [
          "On top of its overall range, a program can require a minimum grade in one specific course — a per-course floor, distinct from the program's overall R-score. That's a real, separate requirement type, not a variant of the range: you can sit inside a program's range and still miss that one course's minimum, or the other way around. Most R-score calculators only track the single overall number and never surface this second requirement at all.",
          "None of the programs currently verified in MaCote carry a confirmed per-course floor yet — the field exists in our data model and stays empty rather than showing a guess, the same rule we apply to any figure we can't source. If one gets confirmed, it'll show up next to that program's range, never folded into it.",
        ],
      },
      {
        id: "lookup-inverse",
        heading: "The reverse lookup: where you stand today",
        body: [
          "Once you have an R-score — confirmed by your cégep or estimated by MaCote — the app checks it against every program's range and assigns one of four statuses: above, inside, below, or not yet verified. That last status doesn't mean \"below\": it means MaCote simply has no published range on file to compare against for that program.",
          "In the box above, an estimated score of 32.41 falls between 31.5 and 38.1 for Law at UdeM, so it's marked \"within range.\" That's not an admission guarantee — just your position against what was published for other cohorts. A range built from 2024 doesn't fix anything for this year's cohort.",
        ],
      },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      {
        q: "Why doesn't MaCote just give me THE minimum R-score for a program?",
        a: "Because that single number doesn't exist the way people picture it. Universities publish different figure types — last admitted, minimum required, maximum, average, or a low/high range — each tied to a specific year, never one guaranteed value for the current year.",
      },
      {
        q: "What's the difference between a per-course floor and a program's range?",
        a: "The program range reflects your overall R-score standing. A per-course floor, when one exists, is a minimum grade required in one specific course, on top of the range — not instead of it. A program can have one, the other, both, or neither.",
      },
      {
        q: "What does \"not yet verified\" mean in the reverse lookup?",
        a: "That MaCote has no published range on file for that program — not that your score falls short. That's different from \"below,\" which means a range exists and your score sits under its minimum.",
      },
      {
        q: "Where does MaCote's program data come from?",
        a: "From admission-statistics pages universities publish directly, when they exist, and from cégep-compiled figures based on SRAM data otherwise. Every figure keeps its verification date and source; when both exist for the same program, MaCote always prefers the university-published number.",
      },
    ],
  },
};
