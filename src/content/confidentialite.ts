// DRAFT — see LEGAL-REVIEW-NOTES.md at the repo root. Not legal advice. A human (ideally a
// lawyer familiar with Quebec's Loi 25) must review this before the site goes live, and the
// [placeholders] below must be filled in with real values first.

export type LegalSection = { heading: string; body: string[] };
export type PrivacyContent = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  lastUpdated: string;
  summaryTitle: string;
  summaryPoints: string[];
  sections: LegalSection[];
};

export const PRIVACY_CONTENT: Record<"fr" | "en", PrivacyContent> = {
  fr: {
    metaTitle: "Politique de confidentialité | MaCote",
    metaDescription: "Ce que MaCote recueille, pourquoi, et où c'est hébergé.",
    title: "Politique de confidentialité",
    lastUpdated: "Dernière mise à jour : 24 août 2026 (brouillon)",
    summaryTitle: "En bref",
    summaryPoints: [
      "Aucune donnée sur ton revenu, celui de ta famille, ou ta situation financière n'est jamais demandée ou collectée — nulle part sur MaCote.",
      "Tes notes et ta cote R sont associées à ton compte, ne sont jamais vendues, ni partagées avec qui que ce soit d'autre.",
      "Avant de créer un compte, ce que tu entres (cégep, programme, notes) reste seulement dans ton navigateur — rien n'est envoyé à un serveur tant que tu n'as pas de compte.",
      "Hébergement : [à confirmer — voir LEGAL-REVIEW-NOTES.md]. L'objectif est un hébergement au Canada; ceci sera précisé ici dès que le fournisseur final est choisi.",
    ],
    sections: [
      {
        heading: "Ce que MaCote recueille, et pourquoi",
        body: [
          "MaCote recueille seulement ce qui sert directement à te montrer ta position par rapport aux programmes et bourses qui t'intéressent : ton cégep, ton programme, ta session, tes notes de cours que tu choisis d'entrer, ta cote R confirmée ou une estimation, les programmes universitaires que tu cibles, et des étiquettes que tu choisis toi-même (bénévolat, sport, arts, etc.) pour faire ressortir des bourses auxquelles tu pourrais être admissible.",
          "Chaque catégorie de donnée sert un but précis et distinct : ton cégep et programme servent à filtrer les bourses de ta fondation locale; tes notes servent au calcul de ta cote R; tes étiquettes servent seulement au jumelage de bourses. Aucune de ces données n'est utilisée à une autre fin sans ton consentement explicite et distinct pour cette nouvelle fin.",
          "MaCote ne demande jamais, et ne demandera jamais : ton revenu ou celui de ta famille, ta situation financière, ta cote de crédit, ou toute autre donnée liée à tes moyens financiers. Le jumelage de bourses fonctionne uniquement à partir de ton cégep, ton programme, ta session et tes étiquettes d'activités.",
        ],
      },
      {
        heading: "Avant un compte : tes données restent dans ton navigateur",
        body: [
          "Tu peux utiliser MaCote — entrer ta cote, voir les programmes que tu dépasses déjà, explorer les bourses — sans créer de compte. Dans ce cas, tout ce que tu entres reste enregistré localement dans ton navigateur (via localStorage), et n'est transmis à aucun serveur. Si tu changes d'appareil ou effaces les données de ton navigateur, cette information locale est perdue — c'est prévu ainsi.",
          "Créer un compte transfère ces données vers un stockage associé à ton compte, pour qu'elles persistent d'une session à l'autre et d'un appareil à l'autre.",
        ],
      },
      {
        heading: "Si tu as moins de 14 ans",
        body: [
          "MaCote s'adresse aux étudiantes et étudiants de cégep, généralement âgés de 16 à 19 ans. La loi québécoise exige un consentement parental pour recueillir des renseignements personnels auprès d'une personne de moins de 14 ans, sauf si la collecte est manifestement à son bénéfice.",
          "Si tu as moins de 14 ans et que tu utilises MaCote, ou si un parent ou tuteur croit que nous avons recueilli des renseignements sur un enfant de moins de 14 ans sans consentement parental, contacte-nous à [courriel de contact — voir Contact] : nous supprimerons ces renseignements.",
        ],
      },
      {
        heading: "Paramètres de confidentialité par défaut",
        body: [
          "Par défaut, aucune de tes étiquettes n'est sélectionnée, aucun programme cible n'est ajouté, et rien de ton profil n'est visible publiquement ou partagé avec d'autres utilisateurs. Tu choisis activement chaque donnée que tu ajoutes à ton profil — rien n'est présélectionné ou activé automatiquement à un niveau moins confidentiel.",
        ],
      },
      {
        heading: "Qui a accès à tes données, et où elles sont hébergées",
        body: [
          "Personne d'autre que toi n'a accès à tes notes, ta cote R ou tes cibles de programme — ces données sont protégées par des règles d'accès (Row Level Security) qui limitent chaque compte à ses propres données.",
          "Hébergement technique : [à confirmer — voir LEGAL-REVIEW-NOTES.md pour le statut exact]. Une évaluation des facteurs relatifs à la vie privée sera complétée avant la mise en service définitive d'un fournisseur d'hébergement, particulièrement si des données quittent le Québec.",
        ],
      },
      {
        heading: "Tes droits : accès, portabilité, suppression",
        body: [
          "Tu peux demander une copie de tes renseignements personnels dans un format structuré et couramment utilisé (par exemple JSON), et tu peux demander la suppression complète de ton compte et de tes données à tout moment.",
          "En ce moment, ces demandes se font par courriel à [courriel de contact — voir Contact] plutôt que par un bouton en libre-service dans l'application — un outil en libre-service est prévu mais n'est pas encore construit. Voir LEGAL-REVIEW-NOTES.md pour le statut exact.",
        ],
      },
      {
        heading: "En cas d'incident de confidentialité",
        body: [
          "Si un incident présentant un risque de préjudice sérieux touche tes renseignements personnels, MaCote s'engage à en aviser la Commission d'accès à l'information du Québec et les personnes concernées, et à tenir un registre des incidents de confidentialité, conformément à la loi. Voir LEGAL-REVIEW-NOTES.md pour le statut d'implémentation de ce processus.",
        ],
      },
      {
        heading: "Responsable de la protection des renseignements personnels",
        body: [
          "[Nom du/de la responsable] est responsable de la protection des renseignements personnels chez MaCote. Pour toute question ou plainte, écris à [courriel de contact — voir Contact].",
        ],
      },
    ],
  },
  en: {
    metaTitle: "Privacy Policy | MaCote",
    metaDescription: "What MaCote collects, why, and where it's hosted.",
    title: "Privacy Policy",
    lastUpdated: "Last updated: August 24, 2026 (draft)",
    summaryTitle: "In short",
    summaryPoints: [
      "No data about your income, your family's income, or your financial situation is ever asked for or collected — anywhere on MaCote.",
      "Your grades and R-score are tied to your account, never sold, never shared with anyone else.",
      "Before you create an account, what you enter (cégep, program, grades) stays only in your browser — nothing is sent to a server until you have an account.",
      "Hosting: [to be confirmed — see LEGAL-REVIEW-NOTES.md]. The goal is Canadian hosting; this will be finalized here once a provider is confirmed.",
    ],
    sections: [
      {
        heading: "What MaCote collects, and why",
        body: [
          "MaCote only collects what's needed to show you where you stand against the programs and bursaries you care about: your cégep, your program, your session, grades you choose to enter, your confirmed or estimated R-score, the university programs you're targeting, and tags you choose yourself (volunteering, sports, arts, etc.) to surface bursaries you might qualify for.",
          "Each category of data serves one specific purpose: your cégep and program filter your local foundation's bursaries; your grades feed your R-score calculation; your tags are used only for bursary matching. None of this data is used for a different purpose without your separate, explicit consent for that new purpose.",
          "MaCote never asks, and never will ask, for: your income or your family's income, your financial situation, your credit standing, or any other data tied to your financial means. Bursary matching runs only on your cégep, program, session, and activity tags.",
        ],
      },
      {
        heading: "Before an account: your data stays in your browser",
        body: [
          "You can use MaCote — enter your score, see the programs you already clear, explore bursaries — without creating an account. In that case, everything you enter is stored locally in your browser (via localStorage) and never sent to a server. If you switch devices or clear your browser data, that local information is lost — that's expected.",
          "Creating an account moves this data into storage tied to your account, so it persists across sessions and devices.",
        ],
      },
      {
        heading: "If you're under 14",
        body: [
          "MaCote is built for cégep students, generally aged 16 to 19. Quebec law requires parental consent to collect personal information from anyone under 14, unless the collection is manifestly for that minor's benefit.",
          "If you're under 14 and using MaCote, or if a parent or guardian believes we've collected information about a child under 14 without parental consent, contact us at [contact email — see Contact]: we'll delete that information.",
        ],
      },
      {
        heading: "Default privacy settings",
        body: [
          "By default, none of your tags are selected, no target programs are added, and nothing in your profile is visible publicly or shared with other users. You actively choose every piece of data you add to your profile — nothing is pre-selected or defaulted to a less private setting.",
        ],
      },
      {
        heading: "Who can access your data, and where it's hosted",
        body: [
          "Nobody but you can access your grades, R-score, or program targets — this data is protected by access rules (Row Level Security) that restrict every account to its own data.",
          "Technical hosting: [to be confirmed — see LEGAL-REVIEW-NOTES.md for the exact status]. A privacy impact assessment will be completed before finalizing a hosting provider, particularly if any data leaves Quebec.",
        ],
      },
      {
        heading: "Your rights: access, portability, deletion",
        body: [
          "You can request a copy of your personal information in a structured, commonly used format (e.g. JSON), and you can request full deletion of your account and data at any time.",
          "Right now, these requests go through email to [contact email — see Contact] rather than a self-serve button in the app — a self-serve tool is planned but not yet built. See LEGAL-REVIEW-NOTES.md for the exact status.",
        ],
      },
      {
        heading: "If a privacy incident happens",
        body: [
          "If an incident presenting a risk of serious harm affects your personal information, MaCote commits to notifying Quebec's Commission d'accès à l'information and the affected individuals, and to keeping an incident register, as required by law. See LEGAL-REVIEW-NOTES.md for this process's implementation status.",
        ],
      },
      {
        heading: "Person responsible for the protection of personal information",
        body: [
          "[Responsible person's name] is responsible for the protection of personal information at MaCote. For any question or complaint, write to [contact email — see Contact].",
        ],
      },
    ],
  },
};
