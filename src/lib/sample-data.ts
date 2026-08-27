import type { SelfTagId } from "@/lib/tags/taxonomy";
import type { BursaryCriteria } from "@/lib/matching/match";
import type { InterestId } from "@/lib/tags/interests";
import { CEGEP_DEC_PROGRAMS } from "@/lib/data/cegep-catalog";
import { ALL_IMPORTANT_DATES } from "@/lib/data/important-dates";

export type Cegep = { id: string; name: string; region: string };

export const CEGEPS: Cegep[] = [
  { id: "sainte-foy", name: "Cégep de Sainte-Foy", region: "Québec" },
  { id: "garneau", name: "Cégep Garneau", region: "Québec" },
  { id: "limoilou", name: "Cégep Limoilou (campus Limoilou)", region: "Québec" },
  { id: "limoilou-charlesbourg", name: "Cégep Limoilou (campus Charlesbourg)", region: "Québec" },
  { id: "champlain-slc", name: "Champlain College St. Lawrence", region: "Québec" },
  { id: "merici", name: "Collège Mérici", region: "Québec" },
  { id: "notre-dame-de-foy", name: "Campus Notre-Dame-de-Foy", region: "Québec" },
  { id: "osullivan-quebec", name: "Collège O'Sullivan de Québec", region: "Québec" },
  { id: "charlevoix", name: "Centre d'études collégiales en Charlevoix", region: "Capitale-Nationale" },
  { id: "bart", name: "Collège Bart", region: "Québec" },
  { id: "conservatoire-quebec", name: "Conservatoire de musique de Québec", region: "Québec" },
  { id: "maisonneuve", name: "Cégep de Maisonneuve", region: "Montréal" },
  { id: "vieux-montreal", name: "Cégep du Vieux Montréal", region: "Montréal" },
  { id: "ahuntsic", name: "Collège Ahuntsic", region: "Montréal" },
  { id: "bois-de-boulogne", name: "Collège de Bois-de-Boulogne", region: "Montréal" },
  { id: "dawson", name: "Dawson College", region: "Montréal" },
  { id: "vanier", name: "Vanier College", region: "Montréal" },
  { id: "marianopolis", name: "Marianopolis College", region: "Montréal" },
  { id: "saint-laurent", name: "Cégep de Saint-Laurent", region: "Montréal" },
  { id: "andre-laurendeau", name: "Cégep André-Laurendeau", region: "Montréal" },
  { id: "rosemont", name: "Collège de Rosemont", region: "Montréal" },
  { id: "marie-victorin", name: "Cégep Marie-Victorin", region: "Montréal" },
  { id: "montmorency", name: "Collège Montmorency", region: "Laval" },
  { id: "edouard-montpetit", name: "Cégep Édouard-Montpetit", region: "Montérégie" },
  { id: "champlain-saint-lambert", name: "Champlain College Saint-Lambert", region: "Montérégie" },
  { id: "saint-jean-sur-richelieu", name: "Cégep de Saint-Jean-sur-Richelieu", region: "Montérégie" },
  { id: "saint-hyacinthe", name: "Cégep de Saint-Hyacinthe", region: "Montérégie" },
  { id: "vallefield", name: "Cégep de Valleyfield", region: "Montérégie" },
  { id: "lionel-groulx", name: "Collège Lionel-Groulx", region: "Laurentides" },
  { id: "saint-jerome", name: "Cégep de Saint-Jérôme", region: "Laurentides" },
  { id: "lanaudiere-joliette", name: "Cégep régional de Lanaudière à Joliette", region: "Lanaudière" },
  { id: "lanaudiere-terrebonne", name: "Cégep régional de Lanaudière à Terrebonne", region: "Lanaudière" },
  { id: "lanaudiere-l-assomption", name: "Cégep régional de Lanaudière à L'Assomption", region: "Lanaudière" },
  { id: "sherbrooke", name: "Cégep de Sherbrooke", region: "Estrie" },
  { id: "champlain-lennoxville", name: "Champlain College Lennoxville", region: "Estrie" },
  { id: "granby", name: "Cégep de Granby", region: "Estrie" },
  { id: "trois-rivieres", name: "Cégep de Trois-Rivières", region: "Mauricie" },
  { id: "shawinigan", name: "Cégep de Shawinigan", region: "Mauricie" },
  { id: "drummondville", name: "Cégep de Drummondville", region: "Centre-du-Québec" },
  { id: "victoriaville", name: "Cégep de Victoriaville", region: "Centre-du-Québec" },
  { id: "outaouais", name: "Cégep de l'Outaouais", region: "Outaouais" },
  { id: "heritage", name: "Heritage College", region: "Outaouais" },
  { id: "chicoutimi", name: "Cégep de Chicoutimi", region: "Saguenay–Lac-Saint-Jean" },
  { id: "jonquiere", name: "Cégep de Jonquière", region: "Saguenay–Lac-Saint-Jean" },
  { id: "alma", name: "Collège d'Alma", region: "Saguenay–Lac-Saint-Jean" },
  { id: "st-felicien", name: "Cégep de Saint-Félicien", region: "Saguenay–Lac-Saint-Jean" },
  { id: "rimouski", name: "Cégep de Rimouski", region: "Bas-Saint-Laurent" },
  { id: "riviere-du-loup", name: "Cégep de Rivière-du-Loup", region: "Bas-Saint-Laurent" },
  { id: "matane", name: "Cégep de Matane", region: "Bas-Saint-Laurent" },
  { id: "la-pocatiere", name: "Cégep de La Pocatière", region: "Bas-Saint-Laurent" },
  { id: "gaspesie", name: "Cégep de la Gaspésie et des Îles", region: "Gaspésie–Îles-de-la-Madeleine" },
  { id: "abitibi", name: "Cégep de l'Abitibi-Témiscamingue", region: "Abitibi-Témiscamingue" },
  { id: "sept-iles", name: "Cégep de Sept-Îles", region: "Côte-Nord" },
  { id: "baie-comeau", name: "Cégep de Baie-Comeau", region: "Côte-Nord" },
  { id: "beauce-appalaches", name: "Cégep Beauce-Appalaches", region: "Chaudière-Appalaches" },
  { id: "levis", name: "Cégep de Lévis", region: "Chaudière-Appalaches" },
  { id: "thetford", name: "Cégep de Thetford", region: "Chaudière-Appalaches" }
];

export type CegepProgram = { id: string; name: string; type: "pre_university" | "technical" };

export const CEGEP_PROGRAMS: CegepProgram[] = CEGEP_DEC_PROGRAMS.map((p) => ({
  id: p.code,
  name: p.nameFr,
  type: p.type,
}));

export type Session = { id: number; labelFr: string; labelEn: string };

export const SESSIONS: Session[] = [
  { id: 1, labelFr: "1ère session (Automne 2026)", labelEn: "1st Semester (Fall 2026)" },
  { id: 2, labelFr: "2e session (Hiver 2027)", labelEn: "2nd Semester (Winter 2027)" },
  { id: 3, labelFr: "3e session (Automne 2027)", labelEn: "3rd Semester (Fall 2027)" },
  { id: 4, labelFr: "4e session (Hiver 2028)", labelEn: "4th Semester (Winter 2028)" },
  { id: 5, labelFr: "5e session (Automne 2028)", labelEn: "5th Semester (Fall 2028)" },
  { id: 6, labelFr: "6e session (Hiver 2029)", labelEn: "6th Semester (Winter 2029)" },
];

export type PrerequisiteStatus = "met" | "missing" | "in_progress";

export type CutoffFigureType =
  | "last_admitted"
  | "minimum_required"
  | "maximum"
  | "average"
  | "range_low"
  | "range_high";

export type CutoffSourceTier = "university_official" | "cegep_compiled";

export type CutoffEntry = {
  year: number;
  cutoff: number;
  figureType: CutoffFigureType;
  sourceTier: CutoffSourceTier;
};

export type UniversityProgram = {
  id: string;
  name: string;
  institution: string;
  description: string;
  interestIds: InterestId[];
  cohortLabel: string;
  courseFloor?: { course: string; minGrade: number; note: string };
  placementRate?: { value: number; note: string };
  professionalOrders?: { codes: string[]; note: string };
  sourceUrl: string;
  lastVerifiedAt: string;
  cutoffHistory: CutoffEntry[];
  prerequisites: { name: string; status: PrerequisiteStatus }[];
};

export const UNIVERSITY_PROGRAMS: UniversityProgram[] = [
  {
    "id": "universite-doctorat-de-1er-cycle-en-medec",
    "name": "Doctorat de 1er cycle en médecine (MD)",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en médecine (MD) à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/doctorat-de-1er-cycle-en-medecine",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-medec-302",
    "name": "Doctorat de 1er cycle en médecine dentaire (DMD)",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en médecine dentaire (DMD) à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/doctorat-de-1er-cycle-en-medecine-dentaire",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Chimie générale et des solutions (202-NYA, 202-NYB)",
        "status": "met"
      },
      {
        "name": "Biologie générale et humaine (101-NYA, 101-LC)",
        "status": "met"
      },
      {
        "name": "Calcul différentiel et intégral (201-NYA, 201-NYB)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et ondes (203-NYA, 203-NYB)",
        "status": "met"
      },
      {
        "name": "Chimie organique",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-pharm",
    "name": "Doctorat de 1er cycle en pharmacie (Pharm. D.)",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en pharmacie (Pharm. D.) à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/doctorat-de-1er-cycle-en-pharmacie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 33.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 33,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 32.8,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Chimie générale et des solutions (202-NYA, 202-NYB)",
        "status": "met"
      },
      {
        "name": "Biologie générale et humaine (101-NYA, 101-LC)",
        "status": "met"
      },
      {
        "name": "Calcul différentiel et intégral (201-NYA, 201-NYB)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et ondes (203-NYA, 203-NYB)",
        "status": "met"
      },
      {
        "name": "Chimie organique",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-droit",
    "name": "Baccalauréat en droit",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en droit à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-droit",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 29.8,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-administration",
    "name": "Baccalauréat en administration des affaires (B.A.A.)",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en administration des affaires (B.A.A.) à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-administration-des-affaires",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-logiciel",
    "name": "Baccalauréat en génie logiciel",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie logiciel à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-genie-logiciel",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-informat",
    "name": "Baccalauréat en génie informatique",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie informatique à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-genie-informatique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-civil",
    "name": "Baccalauréat en génie civil",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie civil à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-genie-civil",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-mecaniqu",
    "name": "Baccalauréat en génie mécanique",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie mécanique à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-genie-mecanique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-electriq",
    "name": "Baccalauréat en génie électrique",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie électrique à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-genie-electrique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-chimique",
    "name": "Baccalauréat en génie chimique",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie chimique à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-genie-chimique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-industri",
    "name": "Baccalauréat en génie industriel",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie industriel à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-genie-industriel",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-informatique",
    "name": "Baccalauréat en informatique",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en informatique à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-informatique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-infir",
    "name": "Baccalauréat en sciences infirmières",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences infirmières à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-sciences-infirmieres",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 24.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 24,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health",
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-physiotherapie",
    "name": "Baccalauréat en physiothérapie",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en physiothérapie à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-physiotherapie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-ergotherapie",
    "name": "Baccalauréat en ergothérapie",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en ergothérapie à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-ergotherapie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-kinesiologie",
    "name": "Baccalauréat en kinésiologie",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en kinésiologie à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-kinesiologie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-nutrition",
    "name": "Baccalauréat en nutrition",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en nutrition à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-nutrition",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-psychologie",
    "name": "Baccalauréat en psychologie",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en psychologie à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-psychologie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 28,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Méthodes quantitatives ou Calcul différentiel",
        "status": "met"
      },
      {
        "name": "Biologie humaine",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-psychoeducatio",
    "name": "Baccalauréat en psychoéducation",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en psychoéducation à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-psychoeducation",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-travail-social",
    "name": "Baccalauréat en travail social",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en travail social à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-travail-social",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-biolo",
    "name": "Baccalauréat en sciences biologiques",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences biologiques à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-biologie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-biochimie",
    "name": "Baccalauréat en biochimie",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en biochimie à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-biochimie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-chimie",
    "name": "Baccalauréat en chimie",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en chimie à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-chimie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-physique",
    "name": "Baccalauréat en physique",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en physique à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-physique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-mathematiques-",
    "name": "Baccalauréat en mathématiques et statistique",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en mathématiques et statistique à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-mathematiques",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-actuariat",
    "name": "Baccalauréat en actuariat",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en actuariat à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-actuariat",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 29.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 29,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-architecture",
    "name": "Baccalauréat en architecture",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en architecture à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-sciences-de-larchitecture",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 31,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-design-graphiq",
    "name": "Baccalauréat en design graphique",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en design graphique à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-design-graphique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-communication-",
    "name": "Baccalauréat en communication publique",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en communication publique à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-communication-publique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-science-politi",
    "name": "Baccalauréat en science politique",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en science politique à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-science-politique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-criminologie",
    "name": "Baccalauréat en criminologie",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en criminologie à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-criminologie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-economie",
    "name": "Baccalauréat en économie",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en économie à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-economique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-agronomie",
    "name": "Baccalauréat en agronomie",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en agronomie à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-agronomie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "environment"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-agroenvi",
    "name": "Baccalauréat en génie agroenvironnemental",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie agroenvironnemental à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-genie-agroenvironnemental",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "environment"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-du-bois-",
    "name": "Baccalauréat en génie du bois et des matériaux biosourcés",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie du bois et des matériaux biosourcés à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-genie-du-bois",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-des-mine",
    "name": "Baccalauréat en génie des mines et de la minéralurgie",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie des mines et de la minéralurgie à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-genie-des-mines",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-geologiq",
    "name": "Baccalauréat en génie géologique",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie géologique à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-genie-geologique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-geoma",
    "name": "Baccalauréat en sciences géomatiques",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences géomatiques à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-sciences-geomatiques",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-enseignement-a",
    "name": "Baccalauréat en enseignement au préscolaire et au primaire",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en enseignement au préscolaire et au primaire à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-enseignement-au-prescolaire-et-au-primaire",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "education"
    ]
  },
  {
    "id": "universite-baccalaureat-en-enseignement-a-961",
    "name": "Baccalauréat en enseignement au secondaire",
    "institution": "Université Laval",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en enseignement au secondaire à Université Laval.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ulaval.ca/etudes/programmes/baccalaureat-en-enseignement-au-secondaire",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "education"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-medec-651",
    "name": "Doctorat de 1er cycle en médecine (MD)",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en médecine (MD) à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/doctorat-de-1er-cycle-en-medecine/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-medec-688",
    "name": "Doctorat de 1er cycle en médecine dentaire (DMD)",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en médecine dentaire (DMD) à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/doctorat-de-1er-cycle-en-medecine-dentaire/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Chimie générale et des solutions (202-NYA, 202-NYB)",
        "status": "met"
      },
      {
        "name": "Biologie générale et humaine (101-NYA, 101-LC)",
        "status": "met"
      },
      {
        "name": "Calcul différentiel et intégral (201-NYA, 201-NYB)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et ondes (203-NYA, 203-NYB)",
        "status": "met"
      },
      {
        "name": "Chimie organique",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-medec-312",
    "name": "Doctorat de 1er cycle en médecine vétérinaire (DMV)",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en médecine vétérinaire (DMV) à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/doctorat-de-1er-cycle-en-medecine-veterinaire/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-pharm-547",
    "name": "Doctorat de 1er cycle en pharmacie (Pharm. D.)",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en pharmacie (Pharm. D.) à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/doctorat-de-1er-cycle-en-pharmacie/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 33.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 33,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 32.8,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Chimie générale et des solutions (202-NYA, 202-NYB)",
        "status": "met"
      },
      {
        "name": "Biologie générale et humaine (101-NYA, 101-LC)",
        "status": "met"
      },
      {
        "name": "Calcul différentiel et intégral (201-NYA, 201-NYB)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et ondes (203-NYA, 203-NYB)",
        "status": "met"
      },
      {
        "name": "Chimie organique",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-optom",
    "name": "Doctorat de 1er cycle en optométrie (O.D.)",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en optométrie (O.D.) à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/doctorat-de-1er-cycle-en-optometrie/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-droit-ll-b",
    "name": "Baccalauréat en droit (LL.B.)",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en droit (LL.B.) à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-droit/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 29.8,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-infir-646",
    "name": "Baccalauréat en sciences infirmières",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences infirmières à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-sciences-infirmieres/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 24.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 24,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health",
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-physiotherapie-780",
    "name": "Baccalauréat en physiothérapie",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en physiothérapie à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-physiotherapie/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-ergotherapie-6",
    "name": "Baccalauréat en ergothérapie",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en ergothérapie à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-ergotherapie/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-orthophonie",
    "name": "Baccalauréat en orthophonie",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en orthophonie à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-orthophonie/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 31,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-audiologie",
    "name": "Baccalauréat en audiologie",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en audiologie à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-audiologie/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 31,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-nutrition-102",
    "name": "Baccalauréat en nutrition",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en nutrition à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-nutrition/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-kinesiologie-53",
    "name": "Baccalauréat en kinésiologie",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en kinésiologie à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-kinesiologie/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-informatique-21",
    "name": "Baccalauréat en informatique",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en informatique à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-informatique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-informatique-e",
    "name": "Baccalauréat en informatique et mathématiques",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en informatique et mathématiques à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-informatique-et-mathematiques/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-bio-informatiq",
    "name": "Baccalauréat en bio-informatique",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en bio-informatique à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-bio-informatique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-psychologie-937",
    "name": "Baccalauréat en psychologie",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en psychologie à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-psychologie/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 28,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Méthodes quantitatives ou Calcul différentiel",
        "status": "met"
      },
      {
        "name": "Biologie humaine",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-psychoeducatio-151",
    "name": "Baccalauréat en psychoéducation",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en psychoéducation à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-psychoeducation/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-travail-social-939",
    "name": "Baccalauréat en travail social",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en travail social à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-travail-social/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-criminologie-402",
    "name": "Baccalauréat en criminologie",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en criminologie à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-criminologie/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-securite-et-et",
    "name": "Baccalauréat en sécurité et études policières",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sécurité et études policières à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-securite-et-etudes-policieres/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-communication--839",
    "name": "Baccalauréat en communication et politique",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en communication et politique à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-communication-et-politique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social",
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-de-la",
    "name": "Baccalauréat en sciences de la communication",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences de la communication à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-sciences-de-la-communication/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science",
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-econo",
    "name": "Baccalauréat en sciences économiques",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences économiques à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-sciences-economiques/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-science-politi-675",
    "name": "Baccalauréat en science politique",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en science politique à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-science-politique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-architecture-693",
    "name": "Baccalauréat en architecture",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en architecture à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-architecture/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 31,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-architecture-d",
    "name": "Baccalauréat en architecture de paysage",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en architecture de paysage à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-architecture-de-paysage/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 31,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-design-d-inter",
    "name": "Baccalauréat en design d'intérieur",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en design d'intérieur à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-design-dinterieur/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-design-industr",
    "name": "Baccalauréat en design industriel",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en design industriel à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-design-industriel/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-urbanisme",
    "name": "Baccalauréat en urbanisme",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en urbanisme à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-urbanisme/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-biolo-464",
    "name": "Baccalauréat en sciences biologiques",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences biologiques à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-sciences-biologiques/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-biochimie-et-m",
    "name": "Baccalauréat en biochimie et médecine moléculaire",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en biochimie et médecine moléculaire à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-biochimie-et-medecine-moleculaire/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-chimie-510",
    "name": "Baccalauréat en chimie",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en chimie à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-chimie/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-physique-668",
    "name": "Baccalauréat en physique",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en physique à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-physique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-mathematiques",
    "name": "Baccalauréat en mathématiques",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en mathématiques à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-mathematiques/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-actuariat-66",
    "name": "Baccalauréat en actuariat",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en actuariat à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-actuariat/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 29.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 29,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-enseignement-a-157",
    "name": "Baccalauréat en enseignement au préscolaire et primaire",
    "institution": "Université de Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en enseignement au préscolaire et primaire à Université de Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://admission.umontreal.ca/programmes/baccalaureat-en-enseignement-prescolaire-et-primaire/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "education"
    ]
  },
  {
    "id": "hec-montre-baccalaureat-en-administration",
    "name": "Baccalauréat en administration des affaires (B.A.A.)",
    "institution": "HEC Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en administration des affaires (B.A.A.) à HEC Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.hec.ca/programmes/baccalaureats/baa/index.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "hec-montre-b-a-a-cheminement-trilingue-fr",
    "name": "B.A.A. cheminement trilingue (Français, Anglais, Espagnol)",
    "institution": "HEC Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en B.A.A. cheminement trilingue (Français, Anglais, Espagnol) à HEC Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.hec.ca/programmes/baccalaureats/baa/cheminements/trilingue.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "hec-montre-b-a-a-specialisation-finance",
    "name": "B.A.A. spécialisation Finance",
    "institution": "HEC Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en B.A.A. spécialisation Finance à HEC Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.hec.ca/programmes/baccalaureats/baa/specialisations/finance.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "hec-montre-b-a-a-specialisation-comptabil",
    "name": "B.A.A. spécialisation Comptabilité professionnelle (CPA)",
    "institution": "HEC Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en B.A.A. spécialisation Comptabilité professionnelle (CPA) à HEC Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.hec.ca/programmes/baccalaureats/baa/specialisations/comptabilite.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "hec-montre-b-a-a-specialisation-intellige",
    "name": "B.A.A. spécialisation Intelligence d'affaires et analytique",
    "institution": "HEC Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en B.A.A. spécialisation Intelligence d'affaires et analytique à HEC Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.hec.ca/programmes/baccalaureats/baa/specialisations/intelligence-affaires.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "hec-montre-b-a-a-specialisation-technolog",
    "name": "B.A.A. spécialisation Technologies d'affaires",
    "institution": "HEC Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en B.A.A. spécialisation Technologies d'affaires à HEC Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.hec.ca/programmes/baccalaureats/baa/specialisations/technologies-affaires.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng",
      "business"
    ]
  },
  {
    "id": "hec-montre-b-a-a-specialisation-marketing",
    "name": "B.A.A. spécialisation Marketing",
    "institution": "HEC Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en B.A.A. spécialisation Marketing à HEC Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.hec.ca/programmes/baccalaureats/baa/specialisations/marketing.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "hec-montre-b-a-a-specialisation-gestion-d",
    "name": "B.A.A. spécialisation Gestion des ressources humaines (CRHA)",
    "institution": "HEC Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en B.A.A. spécialisation Gestion des ressources humaines (CRHA) à HEC Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.hec.ca/programmes/baccalaureats/baa/specialisations/gestion-ressources-humaines.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "hec-montre-b-a-a-specialisation-gestion-d-947",
    "name": "B.A.A. spécialisation Gestion de la chaîne logistique",
    "institution": "HEC Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en B.A.A. spécialisation Gestion de la chaîne logistique à HEC Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.hec.ca/programmes/baccalaureats/baa/specialisations/gestion-chaine-logistique.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "hec-montre-b-a-a-specialisation-entrepren",
    "name": "B.A.A. spécialisation Entrepreneuriat et innovation",
    "institution": "HEC Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en B.A.A. spécialisation Entrepreneuriat et innovation à HEC Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.hec.ca/programmes/baccalaureats/baa/specialisations/entrepreneuriat.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "hec-montre-b-a-a-specialisation-economie-",
    "name": "B.A.A. spécialisation Économie appliquée",
    "institution": "HEC Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en B.A.A. spécialisation Économie appliquée à HEC Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.hec.ca/programmes/baccalaureats/baa/specialisations/economie-appliquee.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "polytechni-baccalaureat-en-genie-logiciel",
    "name": "Baccalauréat en génie logiciel",
    "institution": "Polytechnique Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie logiciel à Polytechnique Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.polymtl.ca/etudes/bacc/logiciel",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "polytechni-baccalaureat-en-genie-informat",
    "name": "Baccalauréat en génie informatique",
    "institution": "Polytechnique Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie informatique à Polytechnique Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.polymtl.ca/etudes/bacc/informatique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "polytechni-baccalaureat-en-genie-aerospat",
    "name": "Baccalauréat en génie aérospatial",
    "institution": "Polytechnique Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie aérospatial à Polytechnique Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.polymtl.ca/etudes/bacc/aerospatial",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "polytechni-baccalaureat-en-genie-biomedic",
    "name": "Baccalauréat en génie biomédical",
    "institution": "Polytechnique Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie biomédical à Polytechnique Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.polymtl.ca/etudes/bacc/biomedical",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "polytechni-baccalaureat-en-genie-chimique",
    "name": "Baccalauréat en génie chimique",
    "institution": "Polytechnique Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie chimique à Polytechnique Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.polymtl.ca/etudes/bacc/chimique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "polytechni-baccalaureat-en-genie-civil",
    "name": "Baccalauréat en génie civil",
    "institution": "Polytechnique Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie civil à Polytechnique Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.polymtl.ca/etudes/bacc/civil",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "polytechni-baccalaureat-en-genie-electriq",
    "name": "Baccalauréat en génie électrique",
    "institution": "Polytechnique Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie électrique à Polytechnique Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.polymtl.ca/etudes/bacc/electrique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "polytechni-baccalaureat-en-genie-industri",
    "name": "Baccalauréat en génie industriel",
    "institution": "Polytechnique Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie industriel à Polytechnique Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.polymtl.ca/etudes/bacc/industriel",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "polytechni-baccalaureat-en-genie-mecaniqu",
    "name": "Baccalauréat en génie mécanique",
    "institution": "Polytechnique Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie mécanique à Polytechnique Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.polymtl.ca/etudes/bacc/mecanique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "polytechni-baccalaureat-en-genie-des-mine",
    "name": "Baccalauréat en génie des mines",
    "institution": "Polytechnique Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie des mines à Polytechnique Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.polymtl.ca/etudes/bacc/mines",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "polytechni-baccalaureat-en-genie-geologiq",
    "name": "Baccalauréat en génie géologique",
    "institution": "Polytechnique Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie géologique à Polytechnique Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.polymtl.ca/etudes/bacc/geologique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "polytechni-baccalaureat-en-genie-physique",
    "name": "Baccalauréat en génie physique",
    "institution": "Polytechnique Montréal",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie physique à Polytechnique Montréal.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.polymtl.ca/etudes/bacc/physique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "mcgill-uni-doctor-of-medicine-and-master-",
    "name": "Doctor of Medicine and Master of Surgery (MDCM)",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctor of Medicine and Master of Surgery (MDCM) à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/medadmissions/programs/mdcm",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 34.5,
        "figureType": "minimum_required",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 34.2,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 34,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "mcgill-uni-doctor-of-dental-medicine-dmd",
    "name": "Doctor of Dental Medicine (DMD)",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctor of Dental Medicine (DMD) à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/dentistry/programs",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-civil-law-and-juri",
    "name": "Bachelor of Civil Law and Juris Doctor (BCL/JD)",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Civil Law and Juris Doctor (BCL/JD) à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/law/admissions",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 29.8,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng",
      "law_social"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-commerce-bcom-desa",
    "name": "Bachelor of Commerce (BCom - Desautels)",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Commerce (BCom - Desautels) à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/desautels/programs/bcom",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-software-engineeri",
    "name": "Bachelor of Software Engineering (B.S.E.)",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Software Engineering (B.S.E.) à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/engineering/future-students/undergraduate-programs/software-engineering",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 29.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 29,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-science-in-compute",
    "name": "Bachelor of Science in Computer Science",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Computer Science à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.cs.mcgill.ca/academic/undergrad/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 29.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 29,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-nursing-integrated",
    "name": "Bachelor of Nursing (Integrated / BScN)",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Nursing (Integrated / BScN) à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/nursing/programs",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 24.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 24,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-science-in-physica",
    "name": "Bachelor of Science in Physical Therapy",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Physical Therapy à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/spot/programs/pt",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-science-in-occupat",
    "name": "Bachelor of Science in Occupational Therapy",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Occupational Therapy à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/spot/programs/ot",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-engineering-in-mec",
    "name": "Bachelor of Engineering in Mechanical Engineering",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Engineering in Mechanical Engineering à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/engineering/future-students/undergraduate-programs/mechanical-engineering",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 26.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 26,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-engineering-in-ele",
    "name": "Bachelor of Engineering in Electrical Engineering",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Engineering in Electrical Engineering à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/engineering/future-students/undergraduate-programs/electrical-engineering",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 26.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 26,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-engineering-in-civ",
    "name": "Bachelor of Engineering in Civil Engineering",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Engineering in Civil Engineering à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/engineering/future-students/undergraduate-programs/civil-engineering",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 26.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 26,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-science-in-microbi",
    "name": "Bachelor of Science in Microbiology and Immunology",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Microbiology and Immunology à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/microimm/undergraduate-programs",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-science-in-anatomy",
    "name": "Bachelor of Science in Anatomy and Cell Biology",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Anatomy and Cell Biology à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/anatomy/undergraduate",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-science-in-physiol",
    "name": "Bachelor of Science in Physiology",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Physiology à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/physiology/undergraduate-studies",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-science-in-psychol",
    "name": "Bachelor of Science in Psychology",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Psychology à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/psychology/undergraduate",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "mcgill-uni-bachelor-of-science-in-archite",
    "name": "Bachelor of Science in Architecture",
    "institution": "McGill University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Architecture à McGill University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.mcgill.ca/architecture/programs/undergraduate",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 31,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "concordia--bachelor-of-commerce-bcomm-joh",
    "name": "Bachelor of Commerce (BComm - John Molson School of Business)",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Commerce (BComm - John Molson School of Business) à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/jmsb/programs/undergraduate/bachelor.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "concordia--bachelor-of-engineering-in-sof",
    "name": "Bachelor of Engineering in Software Engineering",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Engineering in Software Engineering à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/ginacody/computer-science-software-eng/programs/software-engineering-beng.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 29.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 29,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "concordia--bachelor-of-computer-science-b",
    "name": "Bachelor of Computer Science (BCompSc)",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Computer Science (BCompSc) à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/ginacody/computer-science-software-eng/programs/computer-science-bcompsci.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 29.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 29,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "concordia--bachelor-of-engineering-in-mec",
    "name": "Bachelor of Engineering in Mechanical Engineering",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Engineering in Mechanical Engineering à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/ginacody/mechanical-industrial-aerospace-eng/programs/mechanical-eng-beng.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 26.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 26,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "concordia--bachelor-of-engineering-in-aer",
    "name": "Bachelor of Engineering in Aerospace Engineering",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Engineering in Aerospace Engineering à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/ginacody/mechanical-industrial-aerospace-eng/programs/aerospace-eng-beng.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 26.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 26,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "concordia--bachelor-of-engineering-in-civ",
    "name": "Bachelor of Engineering in Civil Engineering",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Engineering in Civil Engineering à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/ginacody/building-civil-environmental-eng/programs/civil-eng-beng.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 26.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 26,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "concordia--bachelor-of-engineering-in-ele",
    "name": "Bachelor of Engineering in Electrical Engineering",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Engineering in Electrical Engineering à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/ginacody/electrical-computer-eng/programs/electrical-eng-beng.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 26.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 26,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "concordia--bachelor-of-fine-arts-in-film-",
    "name": "Bachelor of Fine Arts in Film Production",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Fine Arts in Film Production à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/finearts/cinema/programs/undergraduate/film-production-bfa.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "concordia--bachelor-of-fine-arts-in-desig",
    "name": "Bachelor of Fine Arts in Design",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Fine Arts in Design à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/finearts/design/programs/undergraduate/design-bfa.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "concordia--bachelor-of-arts-in-journalism",
    "name": "Bachelor of Arts in Journalism",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Arts in Journalism à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/artsci/journalism/programs/undergraduate/journalism-ba.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "concordia--bachelor-of-arts-in-psychology",
    "name": "Bachelor of Arts in Psychology",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Arts in Psychology à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/artsci/psychology/programs/undergraduate/psychology-ba.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social",
      "arts_comm"
    ]
  },
  {
    "id": "concordia--bachelor-of-science-in-biology",
    "name": "Bachelor of Science in Biology",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Biology à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/artsci/biology/programs/undergraduate/biology-bsc.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "concordia--bachelor-of-science-in-biochem",
    "name": "Bachelor of Science in Biochemistry",
    "institution": "Concordia University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Biochemistry à Concordia University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.concordia.ca/artsci/chemistry-biochemistry/programs/undergraduate/biochemistry-bsc.html",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-medec-506",
    "name": "Doctorat de 1er cycle en médecine (MD)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en médecine (MD) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/605/doctorat-en-medecine",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-droit-ll-b-605",
    "name": "Baccalauréat en droit (LL.B.)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en droit (LL.B.) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/215/baccalaureat-en-droit",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 29.8,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-droit-et-mba-c",
    "name": "Baccalauréat en droit et MBA (cheminement intégré)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en droit et MBA (cheminement intégré) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/216/droit-mba",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 29.8,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-logiciel-994",
    "name": "Baccalauréat en génie logiciel (coop)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie logiciel (coop) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/280/baccalaureat-en-genie-logiciel",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-informat-558",
    "name": "Baccalauréat en génie informatique (coop)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie informatique (coop) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/279/baccalaureat-en-genie-informatique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-mecaniqu-148",
    "name": "Baccalauréat en génie mécanique (coop)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie mécanique (coop) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/281/baccalaureat-en-genie-mecanique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-civil-co",
    "name": "Baccalauréat en génie civil (coop)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie civil (coop) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/276/baccalaureat-en-genie-civil",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-electriq-402",
    "name": "Baccalauréat en génie électrique (coop)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie électrique (coop) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/278/baccalaureat-en-genie-electrique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-chimique-518",
    "name": "Baccalauréat en génie chimique (coop)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie chimique (coop) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/275/baccalaureat-en-genie-chimique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-biotechn",
    "name": "Baccalauréat en génie biotechnologique (coop)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie biotechnologique (coop) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/274/baccalaureat-en-genie-biotechnologique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-administration-169",
    "name": "Baccalauréat en administration des affaires (B.A.A. coop)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en administration des affaires (B.A.A. coop) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/200/baccalaureat-en-administration-des-affaires",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-infir-406",
    "name": "Baccalauréat en sciences infirmières",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences infirmières à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/260/baccalaureat-en-sciences-infirmieres",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 24.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 24,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health",
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-physiotherapie-729",
    "name": "Baccalauréat en physiothérapie",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en physiothérapie à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/264/baccalaureat-en-physiotherapie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-ergotherapie-288",
    "name": "Baccalauréat en ergothérapie",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en ergothérapie à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/263/baccalaureat-en-ergotherapie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-pharmacologie",
    "name": "Baccalauréat en pharmacologie",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en pharmacologie à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/267/baccalaureat-en-pharmacologie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-psychologie-760",
    "name": "Baccalauréat en psychologie",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en psychologie à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/250/baccalaureat-en-psychologie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 28,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Méthodes quantitatives ou Calcul différentiel",
        "status": "met"
      },
      {
        "name": "Biologie humaine",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-psychoeducatio-195",
    "name": "Baccalauréat en psychoéducation",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en psychoéducation à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/251/baccalaureat-en-psychoeducation",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-informatique-c",
    "name": "Baccalauréat en informatique (coop)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en informatique (coop) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/285/baccalaureat-en-informatique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-biochimie-de-l",
    "name": "Baccalauréat en biochimie de la santé (coop)",
    "institution": "Université de Sherbrooke",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en biochimie de la santé (coop) à Université de Sherbrooke.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.usherbrooke.ca/admission/programme/271/baccalaureat-en-biochimie-de-la-sante",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-droit-sciences",
    "name": "Baccalauréat en droit (sciences juridiques)",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en droit (sciences juridiques) à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-sciences-juridiques",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 29.8,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social",
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-administration-599",
    "name": "Baccalauréat en administration (B.A.A. - ESG UQAM)",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en administration (B.A.A. - ESG UQAM) à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-administration",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "universite-baccalaureat-en-informatique-e-193",
    "name": "Baccalauréat en informatique et génie logiciel",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en informatique et génie logiciel à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-informatique-genie-logiciel",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-psychologie-112",
    "name": "Baccalauréat en psychologie",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en psychologie à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-psychologie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 28,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Méthodes quantitatives ou Calcul différentiel",
        "status": "met"
      },
      {
        "name": "Biologie humaine",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-travail-social-376",
    "name": "Baccalauréat en travail social",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en travail social à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-travail-social",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sexologie",
    "name": "Baccalauréat en sexologie",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sexologie à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-sexologie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-communication--445",
    "name": "Baccalauréat en communication (journalisme)",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en communication (journalisme) à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-communication-journalisme",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-communication--830",
    "name": "Baccalauréat en communication (relations publiques)",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en communication (relations publiques) à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-communication-relations-publiques",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-design-graphiq-5",
    "name": "Baccalauréat en design graphique",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en design graphique à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-design-graphique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-design-de-l-en",
    "name": "Baccalauréat en design de l'environnement",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en design de l'environnement à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-design-environnement",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm",
      "environment"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-biolo-653",
    "name": "Baccalauréat en sciences biologiques",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences biologiques à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-sciences-biologiques",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-biochimie-453",
    "name": "Baccalauréat en biochimie",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en biochimie à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-biochimie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-chimie-656",
    "name": "Baccalauréat en chimie",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en chimie à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-chimie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-actuariat-806",
    "name": "Baccalauréat en actuariat",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en actuariat à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-actuariat",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 29.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 29,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-compt",
    "name": "Baccalauréat en sciences comptables (CPA)",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences comptables (CPA) à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-sciences-comptables",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-enseignement-e",
    "name": "Baccalauréat en enseignement en adaptation scolaire",
    "institution": "Université du Québec à Montréal (UQAM)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en enseignement en adaptation scolaire à Université du Québec à Montréal (UQAM).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://etudier.uqam.ca/programme/baccalaureat-enseignement-adaptation-scolaire",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "education"
    ]
  },
  {
    "id": "ecole-de-t-baccalaureat-en-genie-logiciel",
    "name": "Baccalauréat en génie logiciel",
    "institution": "École de technologie supérieure (ÉTS)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie logiciel à École de technologie supérieure (ÉTS).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.etsmtl.ca/etude/baccalaureat/genie-logiciel",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "ecole-de-t-baccalaureat-en-genie-des-tech",
    "name": "Baccalauréat en génie des technologies de l'information (TI)",
    "institution": "École de technologie supérieure (ÉTS)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie des technologies de l'information (TI) à École de technologie supérieure (ÉTS).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.etsmtl.ca/etude/baccalaureat/genie-technologies-information",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "ecole-de-t-baccalaureat-en-genie-mecaniqu",
    "name": "Baccalauréat en génie mécanique",
    "institution": "École de technologie supérieure (ÉTS)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie mécanique à École de technologie supérieure (ÉTS).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.etsmtl.ca/etude/baccalaureat/genie-mecanique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "ecole-de-t-baccalaureat-en-genie-de-la-co",
    "name": "Baccalauréat en génie de la construction (civil)",
    "institution": "École de technologie supérieure (ÉTS)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie de la construction (civil) à École de technologie supérieure (ÉTS).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.etsmtl.ca/etude/baccalaureat/genie-construction",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "ecole-de-t-baccalaureat-en-genie-electriq",
    "name": "Baccalauréat en génie électrique",
    "institution": "École de technologie supérieure (ÉTS)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie électrique à École de technologie supérieure (ÉTS).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.etsmtl.ca/etude/baccalaureat/genie-electrique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "ecole-de-t-baccalaureat-en-genie-de-la-pr",
    "name": "Baccalauréat en génie de la production automatisée",
    "institution": "École de technologie supérieure (ÉTS)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie de la production automatisée à École de technologie supérieure (ÉTS).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.etsmtl.ca/etude/baccalaureat/genie-production-automatisee",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "ecole-de-t-baccalaureat-en-genie-des-oper",
    "name": "Baccalauréat en génie des opérations et de la logistique",
    "institution": "École de technologie supérieure (ÉTS)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie des opérations et de la logistique à École de technologie supérieure (ÉTS).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.etsmtl.ca/etude/baccalaureat/genie-operations-logistique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "ecole-de-t-baccalaureat-en-genie-aerospat",
    "name": "Baccalauréat en génie aérospatial",
    "institution": "École de technologie supérieure (ÉTS)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie aérospatial à École de technologie supérieure (ÉTS).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.etsmtl.ca/etude/baccalaureat/genie-aerospatial",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-medec-389",
    "name": "Doctorat de 1er cycle en médecine (campus Mauricie UdeM-UQTR)",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en médecine (campus Mauricie UdeM-UQTR) à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/doctorat-medecine",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-chiro",
    "name": "Doctorat de 1er cycle en chiropratique",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en chiropratique à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/doctorat-chiropratique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 32.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 32,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-medec-523",
    "name": "Doctorat de 1er cycle en médecine podiatrique",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en médecine podiatrique à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/doctorat-medecine-podiatrique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 32.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 32,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-pratique-sage-",
    "name": "Baccalauréat en pratique sage-femme",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en pratique sage-femme à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/pratique-sage-femme",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 31,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-infir-757",
    "name": "Baccalauréat en sciences infirmières",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences infirmières à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/sciences-infirmieres",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 24.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 24,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health",
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-ergotherapie-208",
    "name": "Baccalauréat en ergothérapie",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en ergothérapie à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/ergotherapie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-orthophonie-708",
    "name": "Baccalauréat en orthophonie",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en orthophonie à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/orthophonie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 31,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 30.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-mecaniqu-437",
    "name": "Baccalauréat en génie mécanique",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie mécanique à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/genie-mecanique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-industri-531",
    "name": "Baccalauréat en génie industriel",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie industriel à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/genie-industriel",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-electriq-879",
    "name": "Baccalauréat en génie électrique et génie informatique",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie électrique et génie informatique à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/genie-electrique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-informatique-513",
    "name": "Baccalauréat en informatique",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en informatique à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/informatique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-administration-687",
    "name": "Baccalauréat en administration des affaires (B.A.A.)",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en administration des affaires (B.A.A.) à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/administration-affaires",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "universite-baccalaureat-en-psychologie-636",
    "name": "Baccalauréat en psychologie",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en psychologie à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/psychologie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 28,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Méthodes quantitatives ou Calcul différentiel",
        "status": "met"
      },
      {
        "name": "Biologie humaine",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-psychoeducatio-68",
    "name": "Baccalauréat en psychoéducation",
    "institution": "Université du Québec à Trois-Rivières (UQTR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en psychoéducation à Université du Québec à Trois-Rivières (UQTR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqtr.ca/programme/psychoeducation",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-conception-de-",
    "name": "Baccalauréat en conception de jeux vidéo (NAD-UQAC)",
    "institution": "Université du Québec à Chicoutimi (UQAC)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en conception de jeux vidéo (NAD-UQAC) à Université du Québec à Chicoutimi (UQAC).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqac.ca/programme/baccalaureat-en-conception-de-jeux-video/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-animation-3d-e",
    "name": "Baccalauréat en animation 3D et design numérique (NAD-UQAC)",
    "institution": "Université du Québec à Chicoutimi (UQAC)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en animation 3D et design numérique (NAD-UQAC) à Université du Québec à Chicoutimi (UQAC).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqac.ca/programme/baccalaureat-en-animation-3d-et-design-numerique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-medec-546",
    "name": "Doctorat de 1er cycle en médecine (campus Saguenay UdeS-UQAC)",
    "institution": "Université du Québec à Chicoutimi (UQAC)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en médecine (campus Saguenay UdeS-UQAC) à Université du Québec à Chicoutimi (UQAC).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqac.ca/programme/doctorat-en-medecine/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-informat-439",
    "name": "Baccalauréat en génie informatique",
    "institution": "Université du Québec à Chicoutimi (UQAC)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie informatique à Université du Québec à Chicoutimi (UQAC).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqac.ca/programme/baccalaureat-en-genie-informatique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-informatique-252",
    "name": "Baccalauréat en informatique",
    "institution": "Université du Québec à Chicoutimi (UQAC)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en informatique à Université du Québec à Chicoutimi (UQAC).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqac.ca/programme/baccalaureat-en-informatique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-mecaniqu-499",
    "name": "Baccalauréat en génie mécanique",
    "institution": "Université du Québec à Chicoutimi (UQAC)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie mécanique à Université du Québec à Chicoutimi (UQAC).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqac.ca/programme/baccalaureat-en-genie-mecanique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-civil-930",
    "name": "Baccalauréat en génie civil",
    "institution": "Université du Québec à Chicoutimi (UQAC)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie civil à Université du Québec à Chicoutimi (UQAC).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqac.ca/programme/baccalaureat-en-genie-civil/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-geologiq-468",
    "name": "Baccalauréat en génie géologique",
    "institution": "Université du Québec à Chicoutimi (UQAC)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie géologique à Université du Québec à Chicoutimi (UQAC).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqac.ca/programme/baccalaureat-en-genie-geologique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-physiotherapie-605",
    "name": "Baccalauréat en physiothérapie",
    "institution": "Université du Québec à Chicoutimi (UQAC)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en physiothérapie à Université du Québec à Chicoutimi (UQAC).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqac.ca/programme/baccalaureat-en-physiotherapie/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-infir-824",
    "name": "Baccalauréat en sciences infirmières",
    "institution": "Université du Québec à Chicoutimi (UQAC)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences infirmières à Université du Québec à Chicoutimi (UQAC).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqac.ca/programme/baccalaureat-en-sciences-infirmieres/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 24.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 24,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health",
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-administration-879",
    "name": "Baccalauréat en administration (B.A.A.)",
    "institution": "Université du Québec à Chicoutimi (UQAC)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en administration (B.A.A.) à Université du Québec à Chicoutimi (UQAC).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqac.ca/programme/baccalaureat-en-administration/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "universite-baccalaureat-en-plein-air-et-t",
    "name": "Baccalauréat en plein air et tourisme d'aventure",
    "institution": "Université du Québec à Chicoutimi (UQAC)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en plein air et tourisme d'aventure à Université du Québec à Chicoutimi (UQAC).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqac.ca/programme/baccalaureat-en-intervention-plein-air/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-doctorat-de-1er-cycle-en-medec-97",
    "name": "Doctorat de 1er cycle en médecine (campus Rimouski ULaval-UQAR)",
    "institution": "Université du Québec à Rimouski (UQAR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Doctorat de 1er cycle en médecine (campus Rimouski ULaval-UQAR) à Université du Québec à Rimouski (UQAR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqar.ca/etudes/etudier-a-l-uqar/programmes-de-formation/doctorat-en-medecine",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-biologie-scien",
    "name": "Baccalauréat en biologie (sciences marines)",
    "institution": "Université du Québec à Rimouski (UQAR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en biologie (sciences marines) à Université du Québec à Rimouski (UQAR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqar.ca/etudes/etudier-a-l-uqar/programmes-de-formation/baccalaureat-en-biologie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-des-syst",
    "name": "Baccalauréat en génie des systèmes électromécaniques",
    "institution": "Université du Québec à Rimouski (UQAR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie des systèmes électromécaniques à Université du Québec à Rimouski (UQAR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqar.ca/etudes/etudier-a-l-uqar/programmes-de-formation/baccalaureat-en-genie-des-systemes-electromecaniques",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-mecaniqu-190",
    "name": "Baccalauréat en génie mécanique",
    "institution": "Université du Québec à Rimouski (UQAR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie mécanique à Université du Québec à Rimouski (UQAR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqar.ca/etudes/etudier-a-l-uqar/programmes-de-formation/baccalaureat-en-genie-mecanique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-civil-983",
    "name": "Baccalauréat en génie civil",
    "institution": "Université du Québec à Rimouski (UQAR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie civil à Université du Québec à Rimouski (UQAR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqar.ca/etudes/etudier-a-l-uqar/programmes-de-formation/baccalaureat-en-genie-civil",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-informatique-739",
    "name": "Baccalauréat en informatique",
    "institution": "Université du Québec à Rimouski (UQAR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en informatique à Université du Québec à Rimouski (UQAR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqar.ca/etudes/etudier-a-l-uqar/programmes-de-formation/baccalaureat-en-informatique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-infir-223",
    "name": "Baccalauréat en sciences infirmières (Lévis et Rimouski)",
    "institution": "Université du Québec à Rimouski (UQAR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences infirmières (Lévis et Rimouski) à Université du Québec à Rimouski (UQAR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqar.ca/etudes/etudier-a-l-uqar/programmes-de-formation/baccalaureat-en-sciences-infirmieres",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 24.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 24,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health",
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-administration-455",
    "name": "Baccalauréat en administration (B.A.A. Lévis et Rimouski)",
    "institution": "Université du Québec à Rimouski (UQAR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en administration (B.A.A. Lévis et Rimouski) à Université du Québec à Rimouski (UQAR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqar.ca/etudes/etudier-a-l-uqar/programmes-de-formation/baccalaureat-en-administration",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "universite-baccalaureat-en-travail-social-874",
    "name": "Baccalauréat en travail social",
    "institution": "Université du Québec à Rimouski (UQAR)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en travail social à Université du Québec à Rimouski (UQAR).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqar.ca/etudes/etudier-a-l-uqar/programmes-de-formation/baccalaureat-en-travail-social",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-informatique-574",
    "name": "Baccalauréat en informatique",
    "institution": "Université du Québec en Outaouais (UQO)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en informatique à Université du Québec en Outaouais (UQO).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://uqo.ca/etudes/programmes/baccalaureat-en-informatique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-informat-361",
    "name": "Baccalauréat en génie informatique",
    "institution": "Université du Québec en Outaouais (UQO)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie informatique à Université du Québec en Outaouais (UQO).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://uqo.ca/etudes/programmes/baccalaureat-en-genie-informatique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-administration-363",
    "name": "Baccalauréat en administration des affaires (B.A.A.)",
    "institution": "Université du Québec en Outaouais (UQO)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en administration des affaires (B.A.A.) à Université du Québec en Outaouais (UQO).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://uqo.ca/etudes/programmes/baccalaureat-en-administration-des-affaires",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-infir-606",
    "name": "Baccalauréat en sciences infirmières",
    "institution": "Université du Québec en Outaouais (UQO)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences infirmières à Université du Québec en Outaouais (UQO).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://uqo.ca/etudes/programmes/baccalaureat-en-sciences-infirmieres",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 24.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 24,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health",
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-psychoeducatio-648",
    "name": "Baccalauréat en psychoéducation (Gatineau et Saint-Jérôme)",
    "institution": "Université du Québec en Outaouais (UQO)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en psychoéducation (Gatineau et Saint-Jérôme) à Université du Québec en Outaouais (UQO).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://uqo.ca/etudes/programmes/baccalaureat-en-psychoeducation",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-psychologie-76",
    "name": "Baccalauréat en psychologie",
    "institution": "Université du Québec en Outaouais (UQO)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en psychologie à Université du Québec en Outaouais (UQO).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://uqo.ca/etudes/programmes/baccalaureat-en-psychologie",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 28,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Méthodes quantitatives ou Calcul différentiel",
        "status": "met"
      },
      {
        "name": "Biologie humaine",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-travail-social-463",
    "name": "Baccalauréat en travail social",
    "institution": "Université du Québec en Outaouais (UQO)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en travail social à Université du Québec en Outaouais (UQO).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://uqo.ca/etudes/programmes/baccalaureat-en-travail-social",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-bande-dessinee",
    "name": "Baccalauréat en bande dessinée (École multidisciplinaire de l'image)",
    "institution": "Université du Québec en Outaouais (UQO)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en bande dessinée (École multidisciplinaire de l'image) à Université du Québec en Outaouais (UQO).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://uqo.ca/etudes/programmes/baccalaureat-en-bande-dessinee",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-design-graphiq-80",
    "name": "Baccalauréat en design graphique",
    "institution": "Université du Québec en Outaouais (UQO)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en design graphique à Université du Québec en Outaouais (UQO).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://uqo.ca/etudes/programmes/baccalaureat-en-design-graphique",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-creation-numer",
    "name": "Baccalauréat en création numérique et jeux vidéo",
    "institution": "Université du Québec en Abitibi-Témiscamingue (UQAT)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en création numérique et jeux vidéo à Université du Québec en Abitibi-Témiscamingue (UQAT).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqat.ca/etudes/creation-et-nouveaux-medias/baccalaureat-en-creation-de-jeux-video/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-electrom",
    "name": "Baccalauréat en génie électromécanique",
    "institution": "Université du Québec en Abitibi-Témiscamingue (UQAT)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie électromécanique à Université du Québec en Abitibi-Témiscamingue (UQAT).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqat.ca/etudes/ingenierie/baccalaureat-en-genie-electromecanique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-mecaniqu-551",
    "name": "Baccalauréat en génie mécanique",
    "institution": "Université du Québec en Abitibi-Témiscamingue (UQAT)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie mécanique à Université du Québec en Abitibi-Témiscamingue (UQAT).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqat.ca/etudes/ingenierie/baccalaureat-en-genie-mecanique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-genie-civil-539",
    "name": "Baccalauréat en génie civil",
    "institution": "Université du Québec en Abitibi-Témiscamingue (UQAT)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en génie civil à Université du Québec en Abitibi-Témiscamingue (UQAT).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqat.ca/etudes/ingenierie/baccalaureat-en-genie-civil/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-infir-445",
    "name": "Baccalauréat en sciences infirmières",
    "institution": "Université du Québec en Abitibi-Témiscamingue (UQAT)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences infirmières à Université du Québec en Abitibi-Témiscamingue (UQAT).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqat.ca/etudes/sante/baccalaureat-en-sciences-infirmieres/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 24.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 24,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "health",
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-travail-social-762",
    "name": "Baccalauréat en travail social",
    "institution": "Université du Québec en Abitibi-Témiscamingue (UQAT)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en travail social à Université du Québec en Abitibi-Témiscamingue (UQAT).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqat.ca/etudes/sciences-humaines/baccalaureat-en-travail-social/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-administration-455-uqat",
    "name": "Baccalauréat en administration (B.A.A.)",
    "institution": "Université du Québec en Abitibi-Témiscamingue (UQAT)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en administration (B.A.A.) à Université du Québec en Abitibi-Témiscamingue (UQAT).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqat.ca/etudes/gestion/baccalaureat-en-administration/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "universite-baccalaureat-en-etudes-autocht",
    "name": "Baccalauréat en études autochtones",
    "institution": "Université du Québec en Abitibi-Témiscamingue (UQAT)",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en études autochtones à Université du Québec en Abitibi-Témiscamingue (UQAT).",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.uqat.ca/etudes/sciences-humaines/baccalaureat-en-etudes-autochtones/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "bishop-s-u-bachelor-of-business-administr",
    "name": "Bachelor of Business Administration (BBA - Williams School of Business)",
    "institution": "Bishop's University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Business Administration (BBA - Williams School of Business) à Bishop's University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ubishops.ca/academic-programs/williams-school-of-business/bba/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "bishop-s-u-bachelor-of-science-in-compute",
    "name": "Bachelor of Science in Computer Science",
    "institution": "Bishop's University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Computer Science à Bishop's University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ubishops.ca/academic-programs/faculty-of-arts-and-science/natural-sciences-and-mathematics/computer-science/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 29.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 29,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2023,
        "cutoff": 28.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "bishop-s-u-bachelor-of-science-in-pre-med",
    "name": "Bachelor of Science in Pre-Medicine Double Major",
    "institution": "Bishop's University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Pre-Medicine Double Major à Bishop's University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ubishops.ca/academic-programs/faculty-of-arts-and-science/natural-sciences-and-mathematics/pre-medicine/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "bishop-s-u-bachelor-of-arts-in-psychology",
    "name": "Bachelor of Arts in Psychology",
    "institution": "Bishop's University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Arts in Psychology à Bishop's University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ubishops.ca/academic-programs/faculty-of-arts-and-science/social-sciences/psychology/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social",
      "arts_comm"
    ]
  },
  {
    "id": "bishop-s-u-bachelor-of-arts-in-educationa",
    "name": "Bachelor of Arts in Educational Studies",
    "institution": "Bishop's University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Arts in Educational Studies à Bishop's University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ubishops.ca/academic-programs/school-of-education/undergraduate-programs/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm",
      "education"
    ]
  },
  {
    "id": "bishop-s-u-bachelor-of-science-in-biology",
    "name": "Bachelor of Science in Biology",
    "institution": "Bishop's University",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Bachelor of Science in Biology à Bishop's University.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.ubishops.ca/academic-programs/faculty-of-arts-and-science/natural-sciences-and-mathematics/biology/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
  {
    "id": "universite-baccalaureat-en-administration-23",
    "name": "Baccalauréat en administration des affaires (B.A.A. à distance)",
    "institution": "Université TÉLUQ",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en administration des affaires (B.A.A. à distance) à Université TÉLUQ.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.teluq.ca/site/etudes/offre/programmes/baccalaureat-en-administration-des-affaires/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 27.5,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 27,
        "figureType": "last_admitted",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire (201-NYC ou 201-105)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "business"
    ]
  },
  {
    "id": "universite-baccalaureat-en-informatique-a",
    "name": "Baccalauréat en informatique (à distance)",
    "institution": "Université TÉLUQ",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en informatique (à distance) à Université TÉLUQ.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.teluq.ca/site/etudes/offre/programmes/baccalaureat-en-informatique/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Calcul différentiel (201-NYA)",
        "status": "met"
      },
      {
        "name": "Calcul intégral (201-NYB)",
        "status": "met"
      },
      {
        "name": "Algèbre linéaire et géométrie vectorielle (201-NYC)",
        "status": "met"
      },
      {
        "name": "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "tech_eng"
    ]
  },
  {
    "id": "universite-baccalaureat-en-communication--913",
    "name": "Baccalauréat en communication (à distance)",
    "institution": "Université TÉLUQ",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en communication (à distance) à Université TÉLUQ.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.teluq.ca/site/etudes/offre/programmes/baccalaureat-en-communication/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) sans préalables spécifiques",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "arts_comm"
    ]
  },
  {
    "id": "universite-baccalaureat-en-sciences-humai",
    "name": "Baccalauréat en sciences humaines (à distance)",
    "institution": "Université TÉLUQ",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en sciences humaines (à distance) à Université TÉLUQ.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.teluq.ca/site/etudes/offre/programmes/baccalaureat-en-sciences-humaines/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "science"
    ]
  },
  {
    "id": "universite-baccalaureat-en-education-pres",
    "name": "Baccalauréat en éducation préscolaire et primaire (à distance)",
    "institution": "Université TÉLUQ",
    "description": "Formation universitaire de 1er cycle menant au baccalauréat en Baccalauréat en éducation préscolaire et primaire (à distance) à Université TÉLUQ.",
    "cohortLabel": "Automne 2026",
    "sourceUrl": "https://www.teluq.ca/site/etudes/offre/programmes/baccalaureat-en-education-prescolaire-et-enseignement-primaire/",
    "lastVerifiedAt": "2026-08-25",
    "cutoffHistory": [
      {
        "year": 2025,
        "cutoff": 22.5,
        "figureType": "range_low",
        "sourceTier": "university_official"
      },
      {
        "year": 2024,
        "cutoff": 22,
        "figureType": "range_low",
        "sourceTier": "university_official"
      }
    ],
    "prerequisites": [
      {
        "name": "Diplôme d’études collégiales (DEC) reconnu",
        "status": "met"
      }
    ],
    "placementRate": {
      "value": 93,
      "note": "Taux de placement moyen selon Relance MES."
    },
    "interestIds": [
      "law_social"
    ]
  },
];

export type Bursary = {
  id: string;
  name: string;
  sourceOrg: string;
  cegepId: string | null;
  eligibleCegepPrograms: string[] | null;
  eligibleUniversityPrograms: string[] | null;
  minRScore: number | null;
  minSession: number | null;
  tagCriteria: SelfTagId[] | null;
  amountMin: number;
  amountMax: number;
  deadlineIso: string | null;
  deadlinePrecision?: "day" | "month" | "year";
  applicationUrl: string | null;
  hasPublicApplicationLink: boolean;
  requiresEssay: boolean;
  requiresRecommendation: boolean;
  sourceUrl: string;
  lastVerifiedAt: string;
};

export const BURSARIES: Bursary[] = [
  // --- PROGRAMMES PROVINCIAUX ET GOUVERNEMENTAUX ---
  {
    id: "bourse-perspective-quebec",
    name: "Bourses Perspective Québec (TI, Génie, Santé, Éducation)",
    sourceOrg: "Gouvernement du Québec (MES)",
    cegepId: null,
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: 1,
    tagCriteria: ["research", "community_engagement"],
    amountMin: 2500,
    amountMax: 20000,
    deadlineIso: "2027-02-28",
    applicationUrl: "https://www.quebec.ca/education/aide-financiere-aux-etudes/bourses-perspective-quebec",
    hasPublicApplicationLink: true,
    requiresEssay: false,
    requiresRecommendation: false,
    sourceUrl: "https://www.quebec.ca/education/aide-financiere-aux-etudes/bourses-perspective-quebec",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "afe-prets-bourses",
    name: "Programme de prêts et bourses (AFE)",
    sourceOrg: "Aide financière aux études — Gouvernement du Québec",
    cegepId: null,
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: null,
    tagCriteria: null,
    amountMin: 1000,
    amountMax: 15000,
    deadlineIso: null,
    applicationUrl: "https://www.quebec.ca/education/aide-financiere-aux-etudes",
    hasPublicApplicationLink: true,
    requiresEssay: false,
    requiresRecommendation: false,
    sourceUrl: "https://www.quebec.ca/education/aide-financiere-aux-etudes",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "bourses-mes-excellence-collegiale",
    name: "Bourse d'excellence pour la persévérance et la réussite collégiale",
    sourceOrg: "Ministère de l'Enseignement supérieur",
    cegepId: null,
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: 28.0,
    minSession: 2,
    tagCriteria: ["perseverance", "leadership"],
    amountMin: 1000,
    amountMax: 2500,
    deadlineIso: "2026-11-30",
    applicationUrl: null,
    hasPublicApplicationLink: false,
    requiresEssay: false,
    requiresRecommendation: true,
    sourceUrl: "https://www.quebec.ca/education/etudier-au-quebec/aide-financiere",
    lastVerifiedAt: "2026-08-24",
  },

  // --- GRANDES FONDATIONS NATIONALES & CORPORATIVES ---
  {
    id: "desjardins-bourses-etudes",
    name: "Bourse d'études de la Fondation Desjardins (Collégial & Universitaire)",
    sourceOrg: "Fondation Desjardins",
    cegepId: null,
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: null,
    tagCriteria: ["volunteering", "community_engagement", "perseverance"],
    amountMin: 1000,
    amountMax: 5000,
    deadlineIso: "2027-03-31",
    applicationUrl: "https://www.desjardins.com/a-propos/engagements/fondation-desjardins/bourses-etudes/",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: false,
    sourceUrl: "https://www.desjardins.com/a-propos/engagements/fondation-desjardins/bourses-etudes/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "loran-scholars-award",
    name: "Bourse Loran de premier cycle",
    sourceOrg: "Fondation Bourses Loran",
    cegepId: null,
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: 29.0,
    minSession: 3,
    tagCriteria: ["leadership", "volunteering", "community_engagement"],
    amountMin: 10000,
    amountMax: 100000,
    deadlineIso: "2026-10-15",
    applicationUrl: "https://loranscholar.ca/fr/",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: true,
    sourceUrl: "https://loranscholar.ca/fr/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "schulich-leader-scholarship",
    name: "Bourse Schulich Leader (STIM / Sciences, Technologie, Ingénierie, Maths)",
    sourceOrg: "Schulich Foundation",
    cegepId: null,
    eligibleCegepPrograms: ["200.B0", "200.B1", "420.B0"],
    eligibleUniversityPrograms: ["poly-genie-logiciel", "ulaval-genie-logiciel", "mcgill-computer-science"],
    minRScore: 32.0,
    minSession: 3,
    tagCriteria: ["research", "leadership"],
    amountMin: 100000,
    amountMax: 120000,
    deadlineIso: "2027-01-31",
    applicationUrl: "https://schulichleaders.com/fr/",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: true,
    sourceUrl: "https://schulichleaders.com/fr/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "hydro-quebec-collegial",
    name: "Bourses d'excellence Hydro-Québec pour les étudiants en sciences et génie",
    sourceOrg: "Fondation Hydro-Québec",
    cegepId: null,
    eligibleCegepPrograms: ["200.B0", "200.B1", "243.B0", "420.B0"],
    eligibleUniversityPrograms: null,
    minRScore: 28.5,
    minSession: 2,
    tagCriteria: ["research", "environment"],
    amountMin: 2000,
    amountMax: 3000,
    deadlineIso: "2026-11-15",
    applicationUrl: "https://www.hydroquebec.com/engagements/bourses-etudes/",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: false,
    sourceUrl: "https://www.hydroquebec.com/engagements/bourses-etudes/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "forces-avenir-collegial",
    name: "Prix et Bourses Forces AVENIR Collégial (Projets engagés & Personnalités)",
    sourceOrg: "Forces AVENIR",
    cegepId: null,
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: 1,
    tagCriteria: ["leadership", "community_engagement", "volunteering"],
    amountMin: 1000,
    amountMax: 10000,
    deadlineIso: "2027-03-15",
    applicationUrl: "https://www.forcesavenir.qc.ca/collegial/",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: true,
    sourceUrl: "https://www.forcesavenir.qc.ca/collegial/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "aleo-faeq-sport-etudes",
    name: "Bourse Fondation Aléo (FAEQ) — Athlètes d'excellence et Sport-Études",
    sourceOrg: "Fondation Aléo",
    cegepId: null,
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: null,
    tagCriteria: ["sports", "perseverance"],
    amountMin: 1500,
    amountMax: 4000,
    deadlineIso: "2026-10-30",
    applicationUrl: "https://fondationaleo.ca/",
    hasPublicApplicationLink: true,
    requiresEssay: false,
    requiresRecommendation: true,
    sourceUrl: "https://fondationaleo.ca/",
    lastVerifiedAt: "2026-08-24",
  },

  // --- FONDATIONS DE CÉGEPS (QUÉBEC, MONTRÉAL & RÉGIONS) ---
  {
    id: "excellence-sciences-nature-sainte-foy",
    name: "Bourse d'excellence en sciences de la nature",
    sourceOrg: "Fondation du Cégep de Sainte-Foy",
    cegepId: "sainte-foy",
    eligibleCegepPrograms: ["200.B0", "200.B1"],
    eligibleUniversityPrograms: null,
    minRScore: 27.0,
    minSession: null,
    tagCriteria: ["research"],
    amountMin: 1500,
    amountMax: 1500,
    deadlineIso: "2026-10-15",
    applicationUrl: "https://www.cegep-ste-foy.qc.ca/fondation/",
    hasPublicApplicationLink: true,
    requiresEssay: false,
    requiresRecommendation: false,
    sourceUrl: "https://www.cegep-ste-foy.qc.ca/fondation/bourses/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "implication-communautaire-sainte-foy",
    name: "Bourse d'implication communautaire Desjardins",
    sourceOrg: "Fondation du Cégep de Sainte-Foy",
    cegepId: "sainte-foy",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: null,
    tagCriteria: ["volunteering", "community_engagement"],
    amountMin: 500,
    amountMax: 1000,
    deadlineIso: "2026-11-01",
    applicationUrl: "https://www.cegep-ste-foy.qc.ca/fondation/",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: false,
    sourceUrl: "https://www.cegep-ste-foy.qc.ca/fondation/bourses/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "perseverance-sainte-foy",
    name: "Bourse de persévérance scolaire",
    sourceOrg: "Fondation du Cégep de Sainte-Foy",
    cegepId: "sainte-foy",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: 2,
    tagCriteria: ["perseverance"],
    amountMin: 500,
    amountMax: 1000,
    deadlineIso: null,
    applicationUrl: null,
    hasPublicApplicationLink: false,
    requiresEssay: false,
    requiresRecommendation: true,
    sourceUrl: "https://www.cegep-ste-foy.qc.ca/fondation/bourses/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "garneau-excellence-scolaire",
    name: "Bourse d'excellence académique de la Fondation Garneau",
    sourceOrg: "Fondation Cégep Garneau",
    cegepId: "garneau",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: 28.0,
    minSession: 2,
    tagCriteria: ["leadership"],
    amountMin: 1000,
    amountMax: 1500,
    deadlineIso: "2026-10-25",
    applicationUrl: "https://www.cegepgarneau.ca/fondation/bourses",
    hasPublicApplicationLink: true,
    requiresEssay: false,
    requiresRecommendation: false,
    sourceUrl: "https://www.cegepgarneau.ca/fondation/bourses",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "garneau-engagement-etudiant",
    name: "Bourse d'engagement socioculturel et sportif",
    sourceOrg: "Fondation Cégep Garneau",
    cegepId: "garneau",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: 1,
    tagCriteria: ["volunteering", "sports", "arts_culture"],
    amountMin: 500,
    amountMax: 1000,
    deadlineIso: "2026-11-10",
    applicationUrl: "https://www.cegepgarneau.ca/fondation/bourses",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: false,
    sourceUrl: "https://www.cegepgarneau.ca/fondation/bourses",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "limoilou-merite-etudiant",
    name: "Bourse de mérite et réussite de la Fondation Limoilou",
    sourceOrg: "Fondation Québec Philanthrope — Fonds Cégep Limoilou",
    cegepId: "limoilou",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: 27.5,
    minSession: 2,
    tagCriteria: ["perseverance"],
    amountMin: 750,
    amountMax: 1500,
    deadlineIso: "2026-10-31",
    applicationUrl: "https://www.cegeplimoilou.ca/etudiants/bourses/",
    hasPublicApplicationLink: true,
    requiresEssay: false,
    requiresRecommendation: true,
    sourceUrl: "https://www.cegeplimoilou.ca/etudiants/bourses/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "maisonneuve-bourses-reussite",
    name: "Bourse d'excellence et persévérance de la Fondation Maisonneuve",
    sourceOrg: "Fondation du Cégep de Maisonneuve",
    cegepId: "maisonneuve",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: 26.5,
    minSession: 2,
    tagCriteria: ["perseverance", "volunteering"],
    amountMin: 500,
    amountMax: 1500,
    deadlineIso: "2026-11-15",
    applicationUrl: "https://www.cmaisonneuve.qc.ca/fondation/bourses/",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: false,
    sourceUrl: "https://www.cmaisonneuve.qc.ca/fondation/bourses/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "vieux-montreal-bourses-arts-sciences",
    name: "Bourse de la Fondation du Cégep du Vieux Montréal",
    sourceOrg: "Fondation du Cégep du Vieux Montréal",
    cegepId: "vieux-montreal",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: 1,
    tagCriteria: ["arts_culture", "community_engagement"],
    amountMin: 500,
    amountMax: 1200,
    deadlineIso: "2026-11-20",
    applicationUrl: "https://www.cvm.qc.ca/fondation/bourses/",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: false,
    sourceUrl: "https://www.cvm.qc.ca/fondation/bourses/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "ahuntsic-bourses-fondation",
    name: "Bourses d'encouragement aux études du Collège Ahuntsic",
    sourceOrg: "Fondation Collège Ahuntsic",
    cegepId: "ahuntsic",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: 1,
    tagCriteria: ["perseverance", "community_engagement"],
    amountMin: 500,
    amountMax: 1000,
    deadlineIso: "2026-11-05",
    applicationUrl: "https://www.collegeahuntsic.qc.ca/fondation/bourses",
    hasPublicApplicationLink: true,
    requiresEssay: false,
    requiresRecommendation: true,
    sourceUrl: "https://www.collegeahuntsic.qc.ca/fondation/bourses",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "dawson-foundation-bursary",
    name: "Dawson College Foundation Academic & Leadership Award",
    sourceOrg: "Dawson College Foundation",
    cegepId: "dawson",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: 28.0,
    minSession: 2,
    tagCriteria: ["leadership", "volunteering"],
    amountMin: 1000,
    amountMax: 2000,
    deadlineIso: "2026-10-30",
    applicationUrl: "https://www.dawsoncollege.qc.ca/awards-scholarships/",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: true,
    sourceUrl: "https://www.dawsoncollege.qc.ca/awards-scholarships/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "sherbrooke-cegep-bourses",
    name: "Bourse d'excellence et engagement de la Fondation Cégep de Sherbrooke",
    sourceOrg: "Fondation Cégep de Sherbrooke",
    cegepId: "sherbrooke",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: 27.0,
    minSession: 2,
    tagCriteria: ["volunteering", "sports", "arts_culture"],
    amountMin: 500,
    amountMax: 1500,
    deadlineIso: "2026-11-15",
    applicationUrl: "https://cegepsherbrooke.qc.ca/fr/fondation/bourses",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: false,
    sourceUrl: "https://cegepsherbrooke.qc.ca/fr/fondation/bourses",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "trois-rivieres-fondation-bourses",
    name: "Bourses d'études de la Fondation du Cégep de Trois-Rivières",
    sourceOrg: "Fondation du Cégep de Trois-Rivières",
    cegepId: "trois-rivieres",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: 1,
    tagCriteria: ["perseverance", "leadership"],
    amountMin: 500,
    amountMax: 1000,
    deadlineIso: "2026-11-10",
    applicationUrl: "https://fondationcegeptr.qc.ca/bourses/",
    hasPublicApplicationLink: true,
    requiresEssay: false,
    requiresRecommendation: true,
    sourceUrl: "https://fondationcegeptr.qc.ca/bourses/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "outaouais-fondation-bourses",
    name: "Bourse de persévérance et leadership de la Fondation du Cégep de l'Outaouais",
    sourceOrg: "Fondation du Cégep de l'Outaouais",
    cegepId: "outaouais",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: 2,
    tagCriteria: ["leadership", "perseverance"],
    amountMin: 500,
    amountMax: 1000,
    deadlineIso: "2026-11-20",
    applicationUrl: "https://cegepoutaouais.qc.ca/fondation/bourses/",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: false,
    sourceUrl: "https://cegepoutaouais.qc.ca/fondation/bourses/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "chicoutimi-fondation-bourses",
    name: "Bourse de réussite et engagement de la Fondation du Cégep de Chicoutimi",
    sourceOrg: "Fondation du Cégep de Chicoutimi",
    cegepId: "chicoutimi",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: 26.5,
    minSession: 1,
    tagCriteria: ["community_engagement", "research"],
    amountMin: 500,
    amountMax: 1200,
    deadlineIso: "2026-11-15",
    applicationUrl: "https://cchic.ca/fondation/bourses/",
    hasPublicApplicationLink: true,
    requiresEssay: false,
    requiresRecommendation: false,
    sourceUrl: "https://cchic.ca/fondation/bourses/",
    lastVerifiedAt: "2026-08-24",
  },
  {
    id: "rimouski-fondation-bourses",
    name: "Bourses d'études et d'implication de la Fondation du Cégep de Rimouski",
    sourceOrg: "Fondation du Cégep de Rimouski",
    cegepId: "rimouski",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: 1,
    tagCriteria: ["environment", "volunteering"],
    amountMin: 500,
    amountMax: 1000,
    deadlineIso: "2026-11-10",
    applicationUrl: "https://www.cegep-rimouski.qc.ca/fondation",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: false,
    sourceUrl: "https://www.cegep-rimouski.qc.ca/fondation",
    lastVerifiedAt: "2026-08-24",
  },
];

export type Deadline = {
  id: string;
  titleFr: string;
  titleEn: string;
  dateIso: string;
  detailFr: string;
  detailEn: string;
  urgent?: boolean;
  sourceUrl: string;
  lastVerifiedAt: string;
};

export const DEADLINES: Deadline[] = ALL_IMPORTANT_DATES.map((d) => ({
  id: d.id,
  titleFr: d.titleFr,
  titleEn: d.titleEn,
  dateIso: d.dateIso,
  detailFr: d.detailFr,
  detailEn: d.detailEn,
  sourceUrl: d.sourceUrl,
  lastVerifiedAt: d.lastVerifiedAt,
}));

export const STUDENT_SAMPLE = {
  cegep: CEGEPS[0],
  program: CEGEP_PROGRAMS[0],
  session: SESSIONS[0],
  rScoreEstimated: 32.4,
};

export const DASHBOARD_SAMPLE = {
  currentEstimate: 32.41,
  currentSessionLabelFr: "Automne 2026",
  currentSessionLabelEn: "Fall 2026",
  confirmedSessions: [
    { sessionFr: "Hiver 2026", sessionEn: "Winter 2026", score: 31.85 },
    { sessionFr: "Automne 2025", sessionEn: "Fall 2025", score: 30.2 },
  ],
  currentCourses: [
    {
      nameFr: "Calcul différentiel",
      nameEn: "Calculus I",
      code: "201-NYA-05",
      grade: 88,
      groupAverage: 72,
    },
    {
      nameFr: "Physique — Mécanique",
      nameEn: "Physics: Mechanics",
      code: "203-NYA-05",
      grade: 82,
      groupAverage: 75,
    },
    {
      nameFr: "Philosophie et rationalité",
      nameEn: "Philosophy",
      code: "340-101-MQ",
      grade: 76,
      groupAverage: 78,
    },
  ],
  goalProgram: {
    nameFr: "Droit (UdeM)",
    nameEn: "Law (UdeM)",
    cutoffHistory: [
      { year: 2024, cutoff: 31.505, figureType: "last_admitted" as const, sourceTier: "university_official" as const },
      { year: 2024, cutoff: 33.168, figureType: "average" as const, sourceTier: "university_official" as const },
      { year: 2024, cutoff: 38.058, figureType: "maximum" as const, sourceTier: "university_official" as const },
    ],
    sourceUrl: "https://admission.umontreal.ca/statistiques-dadmission-cote-r/",
    lastVerifiedAt: "2026-08-24",
  },
};
