export type SourceLink = {
  title: string;
  institution: string;
  url: string;
  description: string;
  category: "university" | "college" | "governmental" | "bursary" | "formula";
};

export const ALL_SOURCE_LINKS: SourceLink[] = [
  // --- UNIVERSITÉS & SEUILS OFFICIELS ---
  {
    title: "Université Laval — Portail des programmes & Conditions d'admission",
    institution: "Université Laval",
    url: "https://www.ulaval.ca/etudes/programmes",
    description: "Répertoire complet des 40+ baccalauréats et doctorats de 1er cycle avec préalables et cheminements.",
    category: "university",
  },
  {
    title: "Université Laval — Tableau officiel des cotes R minimales (IPC/CRC)",
    institution: "Université Laval",
    url: "https://www.ulaval.ca/sites/default/files/futurs-etudiants/IPC_2024-2025-WEB.pdf",
    description: "Statistiques d'admission officielles et cotes de coupure historiques pour les programmes contingentés.",
    category: "university",
  },
  {
    title: "Université de Montréal — Statistiques d'admission et cote R",
    institution: "Université de Montréal",
    url: "https://admission.umontreal.ca/statistiques-dadmission-cote-r/",
    description: "Tableau officiel des cotes R des personnes admises (dernier admis, moyenne, maximum) par programme.",
    category: "university",
  },
  {
    title: "Université de Montréal — Guide des programmes de premier cycle",
    institution: "Université de Montréal",
    url: "https://admission.umontreal.ca/programmes/",
    description: "Catalogue exhaustif des programmes de 1er cycle de l'UdeM avec exigences spécifiques de cours préalables.",
    category: "university",
  },
  {
    title: "HEC Montréal — Admission au B.A.A. et exigences",
    institution: "HEC Montréal",
    url: "https://www.hec.ca/programmes/baccalaureats/baa/demande-admission",
    description: "Conditions d'admission collégiale, préalables de mathématiques et cheminements du B.A.A.",
    category: "university",
  },
  {
    title: "Polytechnique Montréal — Statistiques et conditions d'admission au baccalauréat",
    institution: "Polytechnique Montréal",
    url: "https://www.polymtl.ca/admission/baccalaureat/conditions-dadmission-au-baccalaureat/statistiques-dadmission",
    description: "Profils d'ingénierie, préalables de sciences et cotes de rendement pour les programmes de génie.",
    category: "university",
  },
  {
    title: "McGill University — Undergraduate Admissions & Minimum R-Scores",
    institution: "McGill University",
    url: "https://www.mcgill.ca/undergraduate-admissions/apply/requirements/quebec",
    description: "Seuils minimaux et préalables de cote R par faculté (Médecine, Droit, Ingénierie, Desautels BCom, Sciences).",
    category: "university",
  },
  {
    title: "Concordia University — CEGEP Admissions Requirements & Cutoffs",
    institution: "Concordia University",
    url: "https://www.concordia.ca/admissions/undergraduate/requirements/cegep.html",
    description: "Exigences minimales d'admission pour les étudiants de cégep (Gina Cody, JMSB, Arts and Science).",
    category: "university",
  },
  {
    title: "Université de Sherbrooke — Statistiques d'admission et cote R",
    institution: "Université de Sherbrooke",
    url: "https://www.usherbrooke.ca/admission/programmes/statistiques-admission-cote-r",
    description: "Historique des cotes de coupure pour la médecine, le droit, le génie coopératif et les programmes de santé.",
    category: "university",
  },
  {
    title: "UQAM — Programmes de 1er cycle et admission",
    institution: "Université du Québec à Montréal (UQAM)",
    url: "https://etudier.uqam.ca/programmes",
    description: "Guide des programmes de l'UQAM, exigences pour les sciences juridiques, ESG UQAM, psychologie et arts.",
    category: "university",
  },
  {
    title: "UQTR — Guide des programmes de 1er cycle et doctorats",
    institution: "Université du Québec à Trois-Rivières (UQTR)",
    url: "https://www.uqtr.ca/programmes",
    description: "Programmes contingentés en santé (médecine podiatrique, chiropratique, sage-femme, ergothérapie).",
    category: "university",
  },
  {
    title: "ÉTS — Baccalauréats en génie et passerelles collégiales",
    institution: "École de technologie supérieure (ÉTS)",
    url: "https://www.etsmtl.ca/etude/baccalaureat",
    description: "Formations d'ingénieurs avec régime coopératif et passerelles pour DEC techniques et sciences de la nature.",
    category: "university",
  },
  {
    title: "UQAC — Programmes et École des arts numériques, de l'animation et du design (NAD)",
    institution: "Université du Québec à Chicoutimi (UQAC)",
    url: "https://www.uqac.ca/programmes/",
    description: "Formations en jeux vidéo, animation 3D, génie et sciences de la santé.",
    category: "university",
  },
  {
    title: "UQAR — Programmes de 1er cycle (Lévis et Rimouski)",
    institution: "Université du Québec à Rimouski (UQAR)",
    url: "https://www.uqar.ca/etudes/etudier-a-l-uqar/programmes-de-formation",
    description: "Formations en sciences marines, génie électromécanique, sciences infirmières et administration.",
    category: "university",
  },
  {
    title: "UQO — Guide des études de 1er cycle (Gatineau et Saint-Jérôme)",
    institution: "Université du Québec en Outaouais (UQO)",
    url: "https://uqo.ca/etudes/programmes",
    description: "Programmes en psychoéducation, bande dessinée (ÉMI), informatique et administration.",
    category: "university",
  },
  {
    title: "UQAT — Programmes de 1er cycle et création numérique",
    institution: "Université du Québec en Abitibi-Témiscamingue (UQAT)",
    url: "https://www.uqat.ca/etudes/",
    description: "Création numérique, génie des mines et forêts, études autochtones et travail social.",
    category: "university",
  },
  {
    title: "Bishop's University — Undergraduate Programs",
    institution: "Bishop's University",
    url: "https://www.ubishops.ca/academic-programs/",
    description: "Williams School of Business, Computer Science, Pre-Medicine et programmes d'arts et sciences.",
    category: "university",
  },
  {
    title: "Université TÉLUQ — Formations universitaires à distance",
    institution: "Université TÉLUQ",
    url: "https://www.teluq.ca/site/etudes/offre/programmes/",
    description: "Programmes de baccalauréats et certificats 100% en ligne reconnus au Québec.",
    category: "university",
  },

  // --- ADMISSION COLLÉGIALE & MES ---
  {
    title: "SRAM — Service régional d'admission du Montréal métropolitain",
    institution: "SRAM",
    url: "https://www.sram.qc.ca/",
    description: "Portail officiel d'admission centralisé pour 32 cégeps du grand Montréal et de l'ouest québécois.",
    category: "college",
  },
  {
    title: "SRACQ — Service régional d'admission au collégial de Québec",
    institution: "SRACQ",
    url: "https://www.sracq.qc.ca/",
    description: "Portail d'admission pour les cégeps de la région de Québec, Chaudière-Appalaches et de l'Est.",
    category: "college",
  },
  {
    title: "SRASL — Service régional d'admission du Saguenay–Lac-Saint-Jean",
    institution: "SRASL",
    url: "https://www.srasl.qc.ca/",
    description: "Admission collégiale pour les établissements du Saguenay–Lac-Saint-Jean.",
    category: "college",
  },
  {
    title: "Ministère de l'Enseignement supérieur (MES) — Liste officielle des programmes collégiaux",
    institution: "Ministère de l'Enseignement supérieur",
    url: "https://www.quebec.ca/education/etudier-au-cegep",
    description: "Nomenclature officielle des programmes d'études collégiales menant au DEC (codes ministériels 200.B0, 300.A0, etc.).",
    category: "governmental",
  },

  // --- COTE R & FORMULES OFFICIELLES ---
  {
    title: "BCI — La cote de rendement au collégial (Cote R) : Guide officiel et foire aux questions",
    institution: "Bureau de coopération interuniversitaire",
    url: "https://www.bci-qc.ca/etudiants/cote-r/",
    description: "Document officiel détaillant la méthode de calcul, l'indicateur de force de groupe (IFG) et la cote Z.",
    category: "formula",
  },

  // --- BOURSES & AIDE FINANCIÈRE ---
  {
    title: "Bourses Perspective Québec — Ministère de l'Enseignement supérieur",
    institution: "Gouvernement du Québec",
    url: "https://www.quebec.ca/education/aide-financiere-aux-etudes/bourses-perspective-quebec",
    description: "Programme de bourses incitatives de 2 500 $ / session pour les programmes en pénurie de main-d'œuvre.",
    category: "bursary",
  },
  {
    title: "Aide financière aux études (AFE) — Prêts et bourses",
    institution: "Gouvernement du Québec",
    url: "https://www.quebec.ca/education/aide-financiere-aux-etudes",
    description: "Simulateur de calcul et dépôt des demandes d'aide financière pour les études collégiales et universitaires.",
    category: "bursary",
  },
  {
    title: "Fondation Desjardins — Bourses d'études postsecondaires",
    institution: "Fondation Desjardins",
    url: "https://www.desjardins.com/a-propos/engagements/fondation-desjardins/bourses-etudes/",
    description: "Appel de candidatures annuel pour des centaines de bourses d'études collégiales et universitaires.",
    category: "bursary",
  },
  {
    title: "Bourses Loran — Fondation Bourses Loran",
    institution: "Fondation Loran",
    url: "https://loranscholar.ca/fr/",
    description: "Bourses nationales de premier cycle d'excellence et d'engagement citoyen.",
    category: "bursary",
  },
  {
    title: "Schulich Leader Scholarships",
    institution: "Schulich Foundation",
    url: "https://schulichleaders.com/fr/",
    description: "Plus importantes bourses de premier cycle en sciences, technologie, ingénierie et mathématiques au Canada.",
    category: "bursary",
  },
  {
    title: "Fondation Hydro-Québec — Bourses universitaires et collégiales",
    institution: "Hydro-Québec",
    url: "https://www.hydroquebec.com/engagements/bourses-etudes/",
    description: "Bourses d'études dans les domaines de l'énergie, du génie et de l'environnement.",
    category: "bursary",
  },
  {
    title: "Forces AVENIR — Programme de bourses collégiales",
    institution: "Forces AVENIR",
    url: "https://www.forcesavenir.qc.ca/collegial/",
    description: "Reconnaissance et financement de projets étudiants engagés et de personnalités collégiales.",
    category: "bursary",
  },
  {
    title: "Fondation Aléo (FAEQ) — Bourses pour étudiants-athlètes",
    institution: "Fondation Aléo",
    url: "https://fondationaleo.ca/",
    description: "Accompagnement financier et bourses de persévérance pour étudiants inscrits en Sport-Études.",
    category: "bursary",
  },
  {
    title: "Fondation du Cégep de Sainte-Foy — Bourses d'études",
    institution: "Cégep de Sainte-Foy",
    url: "https://www.cegep-ste-foy.qc.ca/fondation/bourses/",
    description: "Programme de bourses d'excellence, de persévérance et d'engagement de la fondation.",
    category: "bursary",
  },
  {
    title: "Fondation Cégep Garneau — Répertoire des bourses",
    institution: "Cégep Garneau",
    url: "https://www.cegepgarneau.ca/fondation/bourses",
    description: "Bourses d'encouragement et d'implication pour les étudiants du Cégep Garneau.",
    category: "bursary",
  },
  {
    title: "Fondation du Cégep Limoilou — Bourses de persévérance et réussite",
    institution: "Cégep Limoilou",
    url: "https://www.cegeplimoilou.ca/etudiants/bourses/",
    description: "Bourses distribuées aux campus de Limoilou et de Charlesbourg.",
    category: "bursary",
  },
  {
    title: "Fondation du Cégep de Maisonneuve — Bourses",
    institution: "Cégep de Maisonneuve",
    url: "https://www.cmaisonneuve.qc.ca/fondation/bourses/",
    description: "Bourses d'études et d'implication pour les étudiants de Maisonneuve.",
    category: "bursary",
  },
  {
    title: "Dawson College — Awards & Scholarships Directory",
    institution: "Dawson College",
    url: "https://www.dawsoncollege.qc.ca/awards-scholarships/",
    description: "Directory of internal and external bursaries for Dawson students.",
    category: "bursary",
  }
];
