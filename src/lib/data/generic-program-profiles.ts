/**
 * Standardized Program Profiles for Quebec Pre-University DECs.
 * Keyed by ministerial program code ('300.A0' / '300.M0', '200.B0' / '200.B1').
 *
 * Real profile offerings, course grids, codes, and pondérations researched and compiled
 * for EVERY CEGEP in the Capitale-Nationale / Quebec regional network:
 *   - Cégep de Sainte-Foy (`sainte-foy`)
 *   - Cégep Garneau (`garneau`)
 *   - Cégep Limoilou (`limoilou` / `limoilou-charlesbourg`)
 *   - Champlain College St. Lawrence (`champlain-slc`)
 *   - Campus Notre-Dame-de-Foy (`notre-dame-de-foy`)
 *   - Centre d'études collégiales en Charlevoix (`charlevoix`)
 *   - Collège Mérici (`merici`)
 *
 * REGULATORY CONSTRAINT (Code des professions, art. 37.1):
 * All career examples and pathways are purely factual and sourced from official cégep
 * and university calendars. They must NEVER use personalized advice ("tu devrais faire...")
 * or fit scores, which are legally reserved activities for licensed orientation counselors.
 */

export type CourseItem = {
  code: string;
  nameFr: string;
  nameEn: string;
  ponderation?: string; // e.g. "3-2-3" (Theory - Lab - Homework hours)
  isCore?: boolean;
  prerequisiteFor?: string; // e.g. "Préalable universitaire BAA, Économie"
};

export type CegepProfileOffering = {
  cegepShortCode: string;
  cegepName: string;
  profilNameFr: string;
  profilNameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  mathRequirement: "with_math" | "without_math" | "choice";
  specialFeaturesFr?: string[];
  specialFeaturesEn?: string[];
  specificCourses: CourseItem[];
};

export type ProgramProfileOption = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  offeredAtCegeps: string[];
  cegepOfferingsList: CegepProfileOffering[];
  specificCourses: CourseItem[];
};

export type GenericProgramProfile = {
  programCode: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  profils: ProgramProfileOption[];
  typicalCourses: CourseItem[];
  leadsToProgramCategories: {
    id: string;
    labelFr: string;
    labelEn: string;
  }[];
  factualCareerExamples: {
    titleFr: string;
    titleEn: string;
    fieldFr: string;
    fieldEn: string;
  }[];
  sourceUrl: string;
  lastVerifiedAt: string;
};

export const GENERIC_PROGRAM_PROFILES: GenericProgramProfile[] = [
  {
    programCode: "300.A0",
    name: "Sciences humaines",
    nameEn: "Social Sciences",
    description:
      "Programme préuniversitaire visant à comprendre les comportements humains, les structures sociales, l'économie, la politique et l'histoire. Il prépare aux études universitaires dans plus de 200 programmes de sciences humaines, lettres, droit, éducation et administration.",
    descriptionEn:
      "Pre-university program aimed at understanding human behavior, social structures, economics, politics, and history. It prepares for university studies in over 200 programs across social sciences, humanities, law, education, and administration.",
    profils: [
      {
        id: "admin_gestion",
        name: "Administration, économie et gestion",
        nameEn: "Commerce, Administration & Economics",
        description:
          "Met l'accent sur les mathématiques collégiales préalables (calcul différentiel, calcul intégral et algèbre linéaire), la gestion d'entreprise, la comptabilité et la macroéconomie.",
        descriptionEn:
          "Emphasizes prerequisite collegial mathematics (differential calculus, integral calculus, and linear algebra), business management, accounting, and macroeconomics.",
        offeredAtCegeps: [
          "Cégep de Sainte-Foy",
          "Cégep Garneau",
          "Cégep Limoilou",
          "Champlain St. Lawrence",
          "Centre d'études collégiales en Charlevoix",
        ],
        cegepOfferingsList: [
          {
            cegepShortCode: "sainte-foy",
            cegepName: "Cégep de Sainte-Foy",
            profilNameFr: "Parcours Gestion",
            profilNameEn: "Management Track",
            descriptionFr: "Approfondit les mathématiques préalables complètes, l'analyse économique et la gestion organisationnelle.",
            descriptionEn: "Deepens prerequisite mathematics, economic analysis, and organizational management.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Cheminement en 4 ou 5 sessions", "Participation au concours de cas en gestion"],
            specialFeaturesEn: ["4 or 5 semester pathway", "Business case competition participation"],
            specificCourses: [
              { code: "201-103-RE", nameFr: "Calcul différentiel (Sciences humaines)", nameEn: "Differential Calculus", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire BAA / Économie" },
              { code: "201-203-RE", nameFr: "Calcul intégral (Sciences humaines)", nameEn: "Integral Calculus", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire" },
              { code: "201-105-RE", nameFr: "Algèbre linéaire et vectorielle", nameEn: "Linear Algebra", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire" },
              { code: "401-101-RE", nameFr: "L'entreprise et son environnement de gestion", nameEn: "Business Management", ponderation: "2-1-3" },
              { code: "401-201-RE", nameFr: "Comptabilité financière et analyse d'états financiers", nameEn: "Financial Accounting", ponderation: "2-2-2" },
              { code: "383-201-RE", nameFr: "Macroéconomie et marchés financiers", nameEn: "Macroeconomics", ponderation: "2-1-3" },
            ],
          },
          {
            cegepShortCode: "garneau",
            cegepName: "Cégep Garneau",
            profilNameFr: "Profil Administration, économie et gouvernance",
            profilNameEn: "Administration, Economics & Governance",
            descriptionFr: "Formation orientée vers la prise de décision, les finances de marché et la gestion des organisations publiques et privées.",
            descriptionEn: "Focused on decision-making, market finance, and public/private organizational management.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Zone Sciences humaines", "Simulations boursières et de gouvernance"],
            specialFeaturesEn: ["Social Sciences Zone", "Stock market and governance simulations"],
            specificCourses: [
              { code: "201-103-RE", nameFr: "Calcul différentiel", nameEn: "Differential Calculus", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire BAA" },
              { code: "201-203-RE", nameFr: "Calcul intégral", nameEn: "Integral Calculus", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire" },
              { code: "201-105-RE", nameFr: "Algèbre linéaire et géométrie vectorielle", nameEn: "Linear Algebra", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire" },
              { code: "401-101-RE", nameFr: "Initiation aux affaires et marketing", nameEn: "Introduction to Business & Marketing", ponderation: "2-1-3" },
              { code: "401-201-RE", nameFr: "Comptabilité et gestion financière", nameEn: "Accounting & Financial Management", ponderation: "2-2-2" },
            ],
          },
          {
            cegepShortCode: "limoilou",
            cegepName: "Cégep Limoilou",
            profilNameFr: "Profil Relations économiques et administration (300.M1)",
            profilNameEn: "Economic Relations & Administration",
            descriptionFr: "DEC complet avec préalables en mathématiques pour l'accès direct aux facultés d'administration des affaires (FSA Laval, HEC, etc.).",
            descriptionEn: "Complete DEC with math prerequisites for direct university admission in business administration.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Passerelles universitaires FSA Laval", "Projet entrepreneurial en équipe"],
            specialFeaturesEn: ["FSA Laval university pathways", "Team entrepreneurial project"],
            specificCourses: [
              { code: "201-103-RE", nameFr: "Calcul différentiel", nameEn: "Differential Calculus", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire BAA" },
              { code: "201-203-RE", nameFr: "Calcul intégral", nameEn: "Integral Calculus", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire" },
              { code: "201-105-RE", nameFr: "Algèbre linéaire", nameEn: "Linear Algebra", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire" },
              { code: "401-101-RE", nameFr: "Gestion des organisations et entrepreneuriat", nameEn: "Organizational Management", ponderation: "2-1-3" },
            ],
          },
          {
            cegepShortCode: "champlain-slc",
            cegepName: "Champlain College St. Lawrence",
            profilNameFr: "Commerce Option (Profil Commerce / Affaires)",
            profilNameEn: "Commerce Option (Business Profile)",
            descriptionFr: "Programme anglophone axé sur le calcul collégial, la comptabilité et les études de cas en gestion d'entreprise.",
            descriptionEn: "English-language pre-university commerce curriculum covering calculus, accounting, and business case analysis.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Compétitions intercollégiales de cas de commerce", "Milieu 100% anglophone à Québec"],
            specialFeaturesEn: ["Intercollegiate business case competitions", "Full English-language collegiate environment in Quebec City"],
            specificCourses: [
              { code: "201-103-RE", nameFr: "Calculus I (Differential)", nameEn: "Calculus I (Differential)", ponderation: "3-2-3", prerequisiteFor: "University Commerce Prerequisite (Desautels, JMSB, FSA)" },
              { code: "201-203-RE", nameFr: "Calculus II (Integral)", nameEn: "Calculus II (Integral)", ponderation: "3-2-3", prerequisiteFor: "University Commerce Prerequisite" },
              { code: "201-105-RE", nameFr: "Linear Algebra", nameEn: "Linear Algebra", ponderation: "3-2-3", prerequisiteFor: "University Commerce Prerequisite" },
              { code: "401-101-RE", nameFr: "Introduction to Business Management", nameEn: "Introduction to Business Management", ponderation: "2-1-3" },
              { code: "401-201-RE", nameFr: "Financial Accounting", nameEn: "Financial Accounting", ponderation: "2-2-2" },
            ],
          },
          {
            cegepShortCode: "charlevoix",
            cegepName: "Centre d'études collégiales en Charlevoix",
            profilNameFr: "Profil Mathématiques et société",
            profilNameEn: "Mathematics & Society",
            descriptionFr: "Offre les préalables universitaires en mathématiques dans un milieu collégial à dimension humaine.",
            descriptionEn: "Provides collegial math prerequisites in a close-knit campus environment.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Groupes restreints", "Projets d'études régionaux"],
            specialFeaturesEn: ["Small class sizes", "Regional study projects"],
            specificCourses: [
              { code: "201-103-RE", nameFr: "Calcul différentiel", nameEn: "Differential Calculus", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire" },
              { code: "201-105-RE", nameFr: "Algèbre linéaire", nameEn: "Linear Algebra", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire" },
            ],
          },
        ],
        specificCourses: [
          { code: "201-103-RE", nameFr: "Calcul différentiel en sciences humaines", nameEn: "Differential Calculus (Social Sciences)", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire HEC, BAA, Économie" },
          { code: "201-203-RE", nameFr: "Calcul intégral en sciences humaines", nameEn: "Integral Calculus (Social Sciences)", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire" },
          { code: "201-105-RE", nameFr: "Algèbre linéaire et géométrie vectorielle", nameEn: "Linear Algebra and Vector Geometry", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire" },
          { code: "401-101-RE", nameFr: "L'entreprise et son environnement de gestion", nameEn: "Business Management and Environment", ponderation: "2-1-3" },
          { code: "401-201-RE", nameFr: "Comptabilité financière et analyse d'états financiers", nameEn: "Financial Accounting and Analysis", ponderation: "2-2-2" },
          { code: "383-201-RE", nameFr: "Macroéconomie et marchés financiers mondiaux", nameEn: "Macroeconomics and Financial Markets", ponderation: "2-1-3" },
        ],
      },
      {
        id: "individu_psycho",
        name: "Individu, psychologie et relations humaines",
        nameEn: "Individual, Psychology & Human Relations",
        description:
          "Centré sur la psychologie, la sociologie, le développement humain, la santé mentale et les dynamiques interpersonnelles pour préparer à la psychologie, au travail social, à la psychoéducation et à l'éducation.",
        descriptionEn:
          "Focused on psychology, sociology, human development, mental health, and interpersonal dynamics for pathways in psychology, social work, psychoeducation, and education.",
        offeredAtCegeps: [
          "Cégep de Sainte-Foy",
          "Cégep Garneau",
          "Cégep Limoilou",
          "Champlain St. Lawrence",
          "Campus Notre-Dame-de-Foy",
        ],
        cegepOfferingsList: [
          {
            cegepShortCode: "sainte-foy",
            cegepName: "Cégep de Sainte-Foy",
            profilNameFr: "Parcours Intervention sociale & Parcours Découverte",
            profilNameEn: "Social Intervention Track & Discovery Track",
            descriptionFr: "Axé sur le comportement humain, les rapports sociaux, la diversité culturelle et l'intervention psychosociale.",
            descriptionEn: "Focused on human behavior, social relationships, cultural diversity, and psychosocial intervention.",
            mathRequirement: "choice",
            specialFeaturesFr: ["Laboratoire de psychologie et d'observation", "Sorties sur le terrain et projets d'intervention"],
            specialFeaturesEn: ["Psychology observation laboratory", "Field trips and community intervention projects"],
            specificCourses: [
              { code: "350-201-RE", nameFr: "Psychologie du développement humain", nameEn: "Developmental Psychology", ponderation: "2-1-3" },
              { code: "350-202-RE", nameFr: "Santé mentale et psychopathologie", nameEn: "Mental Health and Psychopathology", ponderation: "2-1-3" },
              { code: "387-201-RE", nameFr: "Sociologie de la famille et diversité", nameEn: "Sociology of Family & Diversity", ponderation: "2-1-3" },
              { code: "101-901-RE", nameFr: "Biologie humaine et système nerveux", nameEn: "Human Biology and Nervous System", ponderation: "2-1-3", prerequisiteFor: "Préalable universitaire Psychologie (B.Sc.)" },
            ],
          },
          {
            cegepShortCode: "garneau",
            cegepName: "Cégep Garneau",
            profilNameFr: "Profil Dynamiques psychosociales et interculturelles (Individu)",
            profilNameEn: "Psychosocial and Intercultural Dynamics (Individual)",
            descriptionFr: "Approfondit la compréhension des comportements individuels et des groupes dans une société pluriculturelle.",
            descriptionEn: "Explores individual behavior and group dynamics within a multicultural society.",
            mathRequirement: "choice",
            specialFeaturesFr: ["Zone Sciences humaines", "Projets d'intervention communautaire"],
            specialFeaturesEn: ["Social Sciences Zone", "Community action projects"],
            specificCourses: [
              { code: "350-201-RE", nameFr: "Psychologie du développement", nameEn: "Developmental Psychology", ponderation: "2-1-3" },
              { code: "350-203-RE", nameFr: "Relations interpersonnelles et communication", nameEn: "Interpersonal Relations", ponderation: "2-1-3" },
              { code: "387-202-RE", nameFr: "Problèmes sociaux et politiques publiques", nameEn: "Social Problems & Public Policy", ponderation: "2-1-3" },
            ],
          },
          {
            cegepShortCode: "limoilou",
            cegepName: "Cégep Limoilou",
            profilNameFr: "Profil Relations humaines et sociétés & Profil Éducation",
            profilNameEn: "Human Relations & Societies & Education Profile",
            descriptionFr: "Met en valeur la relation d'aide, l'éducation et l'intervention sociale avec entente DEC-BAC en éducation avec l'Université Laval.",
            descriptionEn: "Highlights counseling, education, and social intervention, featuring a DEC-BAC education bridge with Université Laval.",
            mathRequirement: "without_math",
            specialFeaturesFr: ["Passerelle DEC-BAC en enseignement (U. Laval)", "Stage d'observation en milieu scolaire ou communautaire"],
            specialFeaturesEn: ["DEC-BAC bridge in teaching (U. Laval)", "Observation practicum in school/community settings"],
            specificCourses: [
              { code: "350-201-RE", nameFr: "Psychologie du développement de l'enfant et de l'adulte", nameEn: "Child & Adult Developmental Psychology", ponderation: "2-1-3" },
              { code: "387-201-RE", nameFr: "Sociologie de l'éducation et de la jeunesse", nameEn: "Sociology of Education and Youth", ponderation: "2-1-3" },
            ],
          },
          {
            cegepShortCode: "notre-dame-de-foy",
            cegepName: "Campus Notre-Dame-de-Foy",
            profilNameFr: "Profil Police et sécurité & Profil Sports",
            profilNameEn: "Police & Security Profile & Sports Profile",
            descriptionFr: "Profils appliqués combinant l'étude du comportement humain, la criminologie, l'entraînement et la sécurité publique.",
            descriptionEn: "Applied profiles combining human behavior, criminology, athletic training, and public security.",
            mathRequirement: "choice",
            specialFeaturesFr: ["Passerelle reconnue vers Techniques policières", "Programme Sports-études collégial"],
            specialFeaturesEn: ["Direct bridge to Police Technology", "Collegiate sports-studies program"],
            specificCourses: [
              { code: "350-202-RE", nameFr: "Psychologie criminologique et santé mentale", nameEn: "Criminal Psychology & Mental Health", ponderation: "2-1-3" },
              { code: "387-202-RE", nameFr: "Sociologie de la déviance et sécurité publique", nameEn: "Sociology of Deviance & Public Security", ponderation: "2-1-3" },
            ],
          },
        ],
        specificCourses: [
          { code: "350-201-RE", nameFr: "Psychologie du développement : enfance, adolescence et adulte", nameEn: "Developmental Psychology", ponderation: "2-1-3" },
          { code: "350-202-RE", nameFr: "Santé mentale, psychopathologie et adaptation", nameEn: "Mental Health and Psychopathology", ponderation: "2-1-3" },
          { code: "350-203-RE", nameFr: "Psychologie des relations interpersonnelles et communication", nameEn: "Interpersonal Relations & Communication", ponderation: "2-1-3" },
          { code: "387-201-RE", nameFr: "Sociologie de la famille et des dynamiques sociales", nameEn: "Sociology of Family & Social Dynamics", ponderation: "2-1-3" },
          { code: "387-202-RE", nameFr: "Problèmes sociaux et intervention communautaire", nameEn: "Social Problems & Community Intervention", ponderation: "2-1-3" },
          { code: "101-901-RE", nameFr: "Biologie humaine et système nerveux", nameEn: "Human Biology and Nervous System", ponderation: "2-1-3", prerequisiteFor: "Préalable universitaire Psychologie (B.Sc.)" },
        ],
      },
      {
        id: "monde_justice",
        name: "Monde, justice et relations internationales",
        nameEn: "Global Studies, Law, Justice & Society",
        description:
          "Explore les fondements du droit québécois, la géopolitique, l'histoire contemporaine, la science politique et les relations diplomatiques pour préparer au droit, à la science politique et aux affaires publiques.",
        descriptionEn:
          "Explores Quebec legal systems, geopolitics, contemporary history, political science, and diplomacy to prepare for law, political science, and public affairs.",
        offeredAtCegeps: [
          "Cégep de Sainte-Foy",
          "Cégep Garneau",
          "Cégep Limoilou",
          "Champlain St. Lawrence",
          "Centre d'études collégiales en Charlevoix",
          "Campus Notre-Dame-de-Foy",
        ],
        cegepOfferingsList: [
          {
            cegepShortCode: "sainte-foy",
            cegepName: "Cégep de Sainte-Foy",
            profilNameFr: "Parcours Monde (Enjeux internationaux)",
            profilNameEn: "World Track (International Affairs)",
            descriptionFr: "Analyse critique des enjeux mondiaux, du droit international et des relations diplomatiques.",
            descriptionEn: "Critical analysis of global challenges, international law, and diplomatic relations.",
            mathRequirement: "choice",
            specialFeaturesFr: ["Simulation de l'ONU à New York", "Projets d'études internationales"],
            specialFeaturesEn: ["New York Model UN simulation", "International studies field projects"],
            specificCourses: [
              { code: "385-201-RE", nameFr: "Relations internationales et diplomatie", nameEn: "International Relations", ponderation: "2-1-3" },
              { code: "385-202-RE", nameFr: "Droit et justice : institutions et libertés fondamentales", nameEn: "Law & Justice: Institutions & Rights", ponderation: "2-1-3" },
              { code: "330-202-RE", nameFr: "Histoire des grandes civilisations et décolonisation", nameEn: "History of Global Civilizations", ponderation: "2-1-3" },
              { code: "320-201-RE", nameFr: "Géopolitique et dynamiques territoriales", nameEn: "Geopolitics", ponderation: "2-1-3" },
            ],
          },
          {
            cegepShortCode: "garneau",
            cegepName: "Cégep Garneau",
            profilNameFr: "Profil Justice et société & Profil Civilisations et histoire",
            profilNameEn: "Justice & Society & Civilizations & History",
            descriptionFr: "Excellente préparation aux facultés de droit, criminologie, histoire et science politique.",
            descriptionEn: "Rigorous preparation for faculties of law, criminology, history, and political science.",
            mathRequirement: "choice",
            specialFeaturesFr: ["Tribunaux-écoles et procès simulés", "Séjours historiques et culturels"],
            specialFeaturesEn: ["Moot court and mock trials", "Historical and cultural study trips"],
            specificCourses: [
              { code: "385-202-RE", nameFr: "Droit et justice au Québec", nameEn: "Law and Justice in Quebec", ponderation: "2-1-3" },
              { code: "330-201-RE", nameFr: "Histoire du Québec et du Canada contemporain", nameEn: "Contemporary Canadian & Quebec History", ponderation: "2-1-3" },
              { code: "385-203-RE", nameFr: "Idéologies politiques et démocratie", nameEn: "Political Ideologies & Democracy", ponderation: "2-1-3" },
            ],
          },
          {
            cegepShortCode: "limoilou",
            cegepName: "Cégep Limoilou",
            profilNameFr: "Profil Défis mondiaux et droits humains",
            profilNameEn: "Global Challenges & Human Rights",
            descriptionFr: "Axé sur la citoyenneté mondiale, les droits de la personne, la justice climatique et la gouvernance internationale.",
            descriptionEn: "Focused on global citizenship, human rights, climate justice, and international governance.",
            mathRequirement: "without_math",
            specialFeaturesFr: ["Engagement communautaire et citoyen", "Voyages d'études et coopération internationale"],
            specialFeaturesEn: ["Community & civic engagement", "Study trips and international cooperation"],
            specificCourses: [
              { code: "385-201-RE", nameFr: "Défis mondiaux et relations internationales", nameEn: "Global Challenges & International Relations", ponderation: "2-1-3" },
              { code: "387-203-RE", nameFr: "Médias, pouvoir et droits humains", nameEn: "Media, Power & Human Rights", ponderation: "2-1-3" },
            ],
          },
          {
            cegepShortCode: "champlain-slc",
            cegepName: "Champlain College St. Lawrence",
            profilNameFr: "Global Studies Option (Profil Études internationales)",
            profilNameEn: "Global Studies Option",
            descriptionFr: "Programme anglophone avec volet voyage d'études intégré et exploration des cultures mondiales.",
            descriptionEn: "English-language curriculum featuring an integrated international travel course component.",
            mathRequirement: "without_math",
            specialFeaturesFr: ["Volet voyage d'études à l'international", "Échange interculturel en anglais"],
            specialFeaturesEn: ["Integrated international travel study component", "Intercultural exchange in English"],
            specificCourses: [
              { code: "385-201-RE", nameFr: "International Relations & Diplomacy", nameEn: "International Relations & Diplomacy", ponderation: "2-1-3" },
              { code: "330-202-RE", nameFr: "World History & Global Issues", nameEn: "World History & Global Issues", ponderation: "2-1-3" },
            ],
          },
        ],
        specificCourses: [
          { code: "385-201-RE", nameFr: "Relations internationales, diplomatie et conflits", nameEn: "International Relations and Diplomacy", ponderation: "2-1-3" },
          { code: "385-202-RE", nameFr: "Droit et justice au Québec : systèmes juridiques et droits fondamentaux", nameEn: "Law and Justice in Quebec", ponderation: "2-1-3" },
          { code: "385-203-RE", nameFr: "Idéologies politiques et gouvernance démocratique", nameEn: "Political Ideologies and Governance", ponderation: "2-1-3" },
          { code: "330-201-RE", nameFr: "Histoire du Québec et du Canada contemporain", nameEn: "Contemporary History of Quebec and Canada", ponderation: "2-1-3" },
          { code: "330-202-RE", nameFr: "Histoire des grandes civilisations et des conflits mondiaux", nameEn: "History of Global Civilizations", ponderation: "2-1-3" },
          { code: "320-201-RE", nameFr: "Géopolitique mondiale et dynamiques territoriales", nameEn: "World Geopolitics and Territorial Dynamics", ponderation: "2-1-3" },
          { code: "387-203-RE", nameFr: "Médias de masse, culture numérique et opinion publique", nameEn: "Mass Media and Digital Culture", ponderation: "2-1-3" },
        ],
      },
    ],
    typicalCourses: [
      { code: "300-300-RE", nameFr: "Initiation pratique à la méthodologie des sciences humaines (IPMSH)", nameEn: "Practical Introduction to Research Methods in Social Sciences", ponderation: "2-2-2", isCore: true },
      { code: "300-302-RE", nameFr: "Méthodes quantitatives en sciences humaines (MQ)", nameEn: "Quantitative Methods in Social Sciences", ponderation: "2-2-2", isCore: true },
      { code: "300-301-RE", nameFr: "Démarche d'intégration des acquis en sciences humaines (DIASH / Épreuve synthèse)", nameEn: "Integrative Seminar in Social Sciences (Comprehensive Assessment)", ponderation: "1-2-3", isCore: true },
      { code: "350-102-RE", nameFr: "Initiation à la psychologie : comportement humain", nameEn: "Introduction to Psychology: Human Behavior", ponderation: "2-1-3", isCore: true },
      { code: "383-102-RE", nameFr: "Économie globale et développement durable", nameEn: "Global Economics and Sustainable Development", ponderation: "2-1-3", isCore: true },
      { code: "385-102-RE", nameFr: "Initiation à la science politique et aux régimes politiques", nameEn: "Introduction to Political Science and Regimes", ponderation: "2-1-3", isCore: true },
      { code: "330-102-RE", nameFr: "Histoire du monde contemporain (XIXe–XXIe siècles)", nameEn: "Contemporary World History", ponderation: "2-1-3", isCore: true },
      { code: "387-102-RE", nameFr: "Sociologie de la diversité et société québécoise", nameEn: "Sociology of Diversity and Quebec Society", ponderation: "2-1-3", isCore: true },
      { code: "320-102-RE", nameFr: "Espace géographique et enjeux planétaires", nameEn: "Geographic Space and Global Challenges", ponderation: "2-1-3", isCore: true },
    ],
    leadsToProgramCategories: [
      { id: "administration", labelFr: "Administration et gestion des affaires (BAA, finance, comptabilité, marketing)", labelEn: "Business Administration & Management (BBA, Finance, Accounting, Marketing)" },
      { id: "droit", labelFr: "Droit (LL.B., B.C.L.), criminologie et relations industrielles", labelEn: "Law (LL.B., B.C.L.), Criminology & Industrial Relations" },
      { id: "psychologie_social", labelFr: "Psychologie, psychoéducation, travail social et sexologie", labelEn: "Psychology, Psychoeducation, Social Work & Sexology" },
      { id: "education", labelFr: "Enseignement (préscolaire, primaire, secondaire) et adaptation scolaire", labelEn: "Education & Teaching (Elementary, Secondary, Special Ed)" },
      { id: "communication", labelFr: "Communication publique, journalisme et relations publiques", labelEn: "Public Communication, Journalism & Public Relations" },
      { id: "politique_international", labelFr: "Science politique, affaires publiques et relations internationales", labelEn: "Political Science, Public Affairs & International Relations" },
      { id: "urbanisme_histoire", labelFr: "Urbanisme, géographie environnementale, histoire et philosophie", labelEn: "Urban Planning, Environmental Geography, History & Philosophy" },
    ],
    factualCareerExamples: [
      { titleFr: "Avocat / Notaire / Conseiller juridique", titleEn: "Lawyer / Notary / Legal Counsel", fieldFr: "Droit & Justice", fieldEn: "Law & Justice" },
      { titleFr: "Conseiller en ressources humaines (CRHA)", titleEn: "Human Resources Advisor (CHRP)", fieldFr: "Gestion & Ressources humaines", fieldEn: "Management & HR" },
      { titleFr: "Analyste financier / Gestionnaire d'entreprise", titleEn: "Financial Analyst / Business Manager", fieldFr: "Administration des affaires & Finance", fieldEn: "Business Administration & Finance" },
      { titleFr: "Psychologue / Psychoéducateur / Travailleur social", titleEn: "Psychologist / Psychoeducator / Social Worker", fieldFr: "Intervention psychosociale & Santé mentale", fieldEn: "Psychosocial Intervention & Mental Health" },
      { titleFr: "Enseignant au primaire, secondaire ou collégial", titleEn: "Primary, Secondary or College Teacher", fieldFr: "Éducation & Pédagogie", fieldEn: "Education & Teaching" },
      { titleFr: "Diplomate / Analyste en politiques publiques", titleEn: "Diplomat / Public Policy Analyst", fieldFr: "Affaires internationales & Fonction publique", fieldEn: "International Affairs & Public Sector" },
      { titleFr: "Journaliste / Spécialiste en relations publiques", titleEn: "Journalist / Public Relations Specialist", fieldFr: "Médias & Communication", fieldEn: "Media & Communications" },
      { titleFr: "Urbaniste / Spécialiste en développement territorial", titleEn: "Urban Planner / Regional Development Specialist", fieldFr: "Urbanisme & Aménagement du territoire", fieldEn: "Urban Planning & Regional Development" },
    ],
    sourceUrl: "https://www.csfoy.ca/etudiants-actuels/services-aux-etudiants/aide-pedagogique/cheminement-en-4-ou-5-sessions/",
    lastVerifiedAt: "2026-08-25",
  },
  {
    programCode: "200.B0",
    name: "Sciences de la nature",
    nameEn: "Natural Sciences",
    description:
      "Programme préuniversitaire rigoureux couvrant les mathématiques différentielles et intégrales, la physique, la chimie et la biologie. Il donne accès à tous les programmes universitaires contingentés en santé (médecine, pharmacie, dentaire), en génie et en sciences fondamentales.",
    descriptionEn:
      "Rigorous pre-university program covering calculus, linear algebra, physics, chemistry, and biology. It provides access to all selective university programs in health sciences (medicine, pharmacy, dentistry), engineering, and fundamental sciences.",
    profils: [
      {
        id: "sante_vie",
        name: "Sciences de la santé et de la vie",
        nameEn: "Health & Life Sciences Profile",
        description:
          "Spécifiquement conçu pour les facultés de santé humaine et animale. Comprend les cours avancés d'anatomie et physiologie humaines, de chimie organique des biomolécules et de biologie cellulaire.",
        descriptionEn:
          "Specifically tailored for university faculties of human and animal health. Includes advanced human anatomy & physiology, organic chemistry of biomolecules, and cellular biology.",
        offeredAtCegeps: [
          "Cégep de Sainte-Foy",
          "Cégep Garneau",
          "Cégep Limoilou",
          "Champlain St. Lawrence",
          "Centre d'études collégiales en Charlevoix",
          "Campus Notre-Dame-de-Foy",
          "Collège Mérici",
        ],
        cegepOfferingsList: [
          {
            cegepShortCode: "sainte-foy",
            cegepName: "Cégep de Sainte-Foy",
            profilNameFr: "Profil Sciences et santé",
            profilNameEn: "Health & Science Profile",
            descriptionFr: "Approche intégrée de la santé globale avec cours de Biologie cellulaire dès la première session.",
            descriptionEn: "Integrated health curriculum with Cell Biology taught in the very first semester.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Biologie cellulaire dès la session 1", "Laboratoires d'anatomie et de biochimie de pointe"],
            specialFeaturesEn: ["Cell Biology from 1st semester", "Cutting-edge anatomy and biochemistry labs"],
            specificCourses: [
              { code: "101-SN2-RE", nameFr: "Anatomie et physiologie humaines", nameEn: "Human Anatomy and Physiology", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire Médecine (MD), Dentaire (DMD), Pharmacie" },
              { code: "202-SN3-RE", nameFr: "Chimie organique et biomolécules", nameEn: "Organic Chemistry & Biomolecules", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire Médecine, Pharmacie, Vétérinaire" },
            ],
          },
          {
            cegepShortCode: "garneau",
            cegepName: "Cégep Garneau",
            profilNameFr: "Profil Sciences de la santé (Santé)",
            profilNameEn: "Health Science Profile",
            descriptionFr: "Formation approfondie en biologie cellulaire, génétique et microbiologie appliquée à la santé humaine.",
            descriptionEn: "In-depth biology, genetics, and applied microbiology tailored for health careers.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Option Microbiologie appliquée", "Optionnel au sein du Baccalauréat International (BI)"],
            specialFeaturesEn: ["Applied Microbiology option", "Available within the International Baccalaureate (IB)"],
            specificCourses: [
              { code: "101-SN2-RE", nameFr: "Anatomie et physiologie humaines", nameEn: "Human Anatomy and Physiology", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire santé" },
              { code: "202-SN3-RE", nameFr: "Chimie organique", nameEn: "Organic Chemistry", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire santé" },
              { code: "101-SN3-RE", nameFr: "Microbiologie appliquée", nameEn: "Applied Microbiology", ponderation: "2-2-2" },
            ],
          },
          {
            cegepShortCode: "limoilou",
            cegepName: "Cégep Limoilou",
            profilNameFr: "Profil Sciences de la santé",
            profilNameEn: "Health Science Profile",
            descriptionFr: "Offert aux campus de Limoilou et de Charlesbourg, axé sur les sciences biomédicales et les protocoles de recherche.",
            descriptionEn: "Offered at both Limoilou and Charlesbourg campuses, focused on biomedical sciences and research protocols.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Offert à Limoilou et Charlesbourg", "Centre d'aide en sciences et mentorat"],
            specialFeaturesEn: ["Offered at Limoilou and Charlesbourg", "Science help center and peer tutoring"],
            specificCourses: [
              { code: "101-SN2-RE", nameFr: "Anatomie et physiologie humaines", nameEn: "Human Anatomy and Physiology", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire santé" },
              { code: "202-SN3-RE", nameFr: "Chimie organique", nameEn: "Organic Chemistry", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire santé" },
            ],
          },
          {
            cegepShortCode: "champlain-slc",
            cegepName: "Champlain College St. Lawrence",
            profilNameFr: "Health Science Profile (Profil Sciences de la santé)",
            profilNameEn: "Health Science Profile",
            descriptionFr: "Programme anglophone préparant aux facultés de médecine de McGill, Laval, Sherbrooke et Montréal.",
            descriptionEn: "English-language pre-med curriculum preparing for medical faculties at McGill, Laval, Sherbrooke, and Montreal.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Excellence en admission médicale McGill et Laval", "Double DEC Sciences + Musique ou ALC"],
            specialFeaturesEn: ["Strong track record for McGill & Laval med admissions", "Double DEC Science + ALC or Music"],
            specificCourses: [
              { code: "101-SN2-RE", nameFr: "Human Anatomy & Physiology", nameEn: "Human Anatomy & Physiology", ponderation: "3-2-3", prerequisiteFor: "Pre-med prerequisite (MD, DMD, Pharm.D.)" },
              { code: "202-SN3-RE", nameFr: "Organic Chemistry", nameEn: "Organic Chemistry", ponderation: "3-2-3", prerequisiteFor: "Pre-med prerequisite" },
            ],
          },
        ],
        specificCourses: [
          { code: "101-SN2-RE", nameFr: "Anatomie et physiologie humaines", nameEn: "Human Anatomy and Physiology", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire Médecine (MD), Dentaire (DMD), Pharmacie (Pharm.D.)" },
          { code: "202-SN3-RE", nameFr: "Chimie organique et biomolécules", nameEn: "Organic Chemistry & Biomolecules", ponderation: "3-2-3", prerequisiteFor: "Préalable universitaire Médecine, Pharmacie, Médecine vétérinaire" },
          { code: "101-SN3-RE", nameFr: "Génétique moléculaire et biologie cellulaire avancée", nameEn: "Molecular Genetics & Advanced Cell Biology", ponderation: "2-2-2" },
          { code: "202-SN4-RE", nameFr: "Biochimie structurale et métabolisme", nameEn: "Structural Biochemistry & Metabolism", ponderation: "2-2-2" },
        ],
      },
      {
        id: "pures_appliquees",
        name: "Sciences pures et appliquées, génie et technologies",
        nameEn: "Pure & Applied Sciences, Engineering & Tech",
        description:
          "Met l'accent sur les trois cours de physique collégiale, les mathématiques appliquées, l'algorithmique et l'astrophysique. Prépare aux facultés de génie (Polytechnique, Laval, McGill), d'informatique, d'actuariat et de physique.",
        descriptionEn:
          "Emphasizes the three collegial physics courses, applied mathematics, computer algorithms, and astrophysics. Prepares for engineering (Polytechnique, Laval, McGill), computer science, actuarial science, and physics.",
        offeredAtCegeps: [
          "Cégep de Sainte-Foy",
          "Cégep Garneau",
          "Cégep Limoilou",
          "Champlain St. Lawrence",
          "Centre d'études collégiales en Charlevoix",
          "Campus Notre-Dame-de-Foy",
          "Collège Mérici",
        ],
        cegepOfferingsList: [
          {
            cegepShortCode: "sainte-foy",
            cegepName: "Cégep de Sainte-Foy",
            profilNameFr: "Profil Sciences et technologies & Profil Sciences en action",
            profilNameEn: "Science & Technology Track & Science in Action Track",
            descriptionFr: "Programmation en Python dès la 1re session pour Sciences et technologies; expérimentation de terrain pour Sciences en action.",
            descriptionEn: "Python programming from semester 1 for Science & Tech; fieldwork and data gathering for Science in Action.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Informatique/Programmation dès la 1re session", "Projets de robotique et clubs scientifiques de haut niveau"],
            specialFeaturesEn: ["Computer programming in 1st semester", "Robotics projects and competitive science clubs"],
            specificCourses: [
              { code: "203-SN4-RE", nameFr: "Astrophysique et mécanique céleste", nameEn: "Astrophysics", ponderation: "3-2-3" },
              { code: "203-SN5-RE", nameFr: "Mécanique appliquée et statique", nameEn: "Applied Mechanics & Statics", ponderation: "3-2-3", prerequisiteFor: "Génie civil, mécanique, aérospatial" },
              { code: "420-SN2-RE", nameFr: "Algorithmes avancés et modélisation numérique", nameEn: "Advanced Algorithms & Modeling", ponderation: "2-2-2", prerequisiteFor: "Génie logiciel & Informatique" },
            ],
          },
          {
            cegepShortCode: "garneau",
            cegepName: "Cégep Garneau",
            profilNameFr: "Profil Sciences pures et appliquées",
            profilNameEn: "Pure and Applied Science Profile",
            descriptionFr: "Formation poussée en physique appliquée, calcul vectoriel et modélisation informatique.",
            descriptionEn: "Advanced physics, vector calculus, and computational modeling.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Laboratoires d'optique et de mécanique", "Optionnel au sein du Baccalauréat International (BI)"],
            specialFeaturesEn: ["Optics and mechanics laboratories", "Available within the International Baccalaureate (IB)"],
            specificCourses: [
              { code: "203-SN4-RE", nameFr: "Astrophysique et mécanique céleste", nameEn: "Astrophysics", ponderation: "3-2-3" },
              { code: "201-SN5-RE", nameFr: "Calcul avancé pour l'ingénieur", nameEn: "Advanced Calculus for Engineering", ponderation: "3-2-3" },
            ],
          },
          {
            cegepShortCode: "limoilou",
            cegepName: "Cégep Limoilou",
            profilNameFr: "Profil Sciences pures et appliquées",
            profilNameEn: "Pure and Applied Science Profile",
            descriptionFr: "Très forte tradition technologique et de génie, laboratoires techniques d'électronique et d'informatique.",
            descriptionEn: "Strong engineering and technology tradition, with access to specialized technical labs.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Accès aux ateliers de technologie et d'ingénierie", "Projet intégrateur axé sur l'innovation"],
            specialFeaturesEn: ["Access to technical and engineering workshops", "Capstone innovation project"],
            specificCourses: [
              { code: "203-SN5-RE", nameFr: "Mécanique appliquée", nameEn: "Applied Mechanics", ponderation: "3-2-3", prerequisiteFor: "Facultés de génie" },
              { code: "420-SN1-RE", nameFr: "Programmation scientifique", nameEn: "Scientific Programming", ponderation: "1-2-2" },
            ],
          },
          {
            cegepShortCode: "champlain-slc",
            cegepName: "Champlain College St. Lawrence",
            profilNameFr: "Pure and Applied Science Profile",
            profilNameEn: "Pure and Applied Science Profile",
            descriptionFr: "Formation scientifique en anglais préparant aux programmes d'ingénierie de McGill, Polytechnique Montréal et Concordia.",
            descriptionEn: "Rigorous English-language science curriculum tailored for engineering programs at McGill, Polytechnique, and Concordia.",
            mathRequirement: "with_math",
            specialFeaturesFr: ["Préparation ciblée pour l'ingénierie McGill / Polytechnique", "Club d'ingénierie et de robotique"],
            specialFeaturesEn: ["Targeted preparation for McGill/Polytechnique engineering", "Engineering & robotics club"],
            specificCourses: [
              { code: "203-SN4-RE", nameFr: "Astrophysics & Celestial Mechanics", nameEn: "Astrophysics & Celestial Mechanics", ponderation: "3-2-3" },
              { code: "203-SN5-RE", nameFr: "Applied Mechanics & Statics", nameEn: "Applied Mechanics & Statics", ponderation: "3-2-3", prerequisiteFor: "Engineering faculties" },
            ],
          },
        ],
        specificCourses: [
          { code: "203-SN4-RE", nameFr: "Astrophysique et mécanique céleste", nameEn: "Astrophysics and Celestial Mechanics", ponderation: "3-2-3" },
          { code: "203-SN5-RE", nameFr: "Mécanique appliquée, statique et résistance des matériaux", nameEn: "Applied Mechanics and Statics for Engineering", ponderation: "3-2-3", prerequisiteFor: "Facultés de génie civil, mécanique et aérospatial" },
          { code: "201-SN5-RE", nameFr: "Calcul avancé et mathématiques pour l'ingénieur", nameEn: "Advanced Calculus & Mathematics for Engineering", ponderation: "3-2-3" },
          { code: "420-SN2-RE", nameFr: "Algorithmes avancés, simulation et modélisation scientifique", nameEn: "Scientific Computing and Simulation", ponderation: "2-2-2", prerequisiteFor: "Informatique & Génie logiciel" },
        ],
      },
    ],
    typicalCourses: [
      { code: "201-NYA-05", nameFr: "Calcul différentiel (00UN)", nameEn: "Differential Calculus", ponderation: "3-2-3", isCore: true, prerequisiteFor: "Préalable universitaire obligatoire universel" },
      { code: "201-NYB-05", nameFr: "Calcul intégral (00UP)", nameEn: "Integral Calculus", ponderation: "3-2-3", isCore: true, prerequisiteFor: "Préalable universitaire obligatoire universel" },
      { code: "201-NYC-05", nameFr: "Algèbre linéaire et géométrie vectorielle (00UQ)", nameEn: "Linear Algebra & Vector Geometry", ponderation: "3-2-3", isCore: true, prerequisiteFor: "Préalable universitaire obligatoire universel" },
      { code: "201-SN4-RE", nameFr: "Probabilités et statistiques appliquées aux sciences (00UR)", nameEn: "Probability and Statistics in Science", ponderation: "2-1-3", isCore: true },
      { code: "203-NYA-05", nameFr: "Physique : Mécanique classique (00UR)", nameEn: "Mechanics", ponderation: "3-2-3", isCore: true, prerequisiteFor: "Préalable universitaire obligatoire" },
      { code: "203-NYB-05", nameFr: "Physique : Électricité et magnétisme (00US)", nameEn: "Electricity and Magnetism", ponderation: "3-2-3", isCore: true, prerequisiteFor: "Préalable universitaire obligatoire" },
      { code: "203-NYC-05", nameFr: "Physique : Ondes, optique et physique moderne (00UT)", nameEn: "Waves, Optics and Modern Physics", ponderation: "3-2-3", isCore: true, prerequisiteFor: "Préalable universitaire obligatoire" },
      { code: "202-NYA-05", nameFr: "Chimie générale : la matière (00UL)", nameEn: "General Chemistry: Matter", ponderation: "3-2-3", isCore: true, prerequisiteFor: "Préalable universitaire obligatoire" },
      { code: "202-NYB-05", nameFr: "Chimie des solutions (00UM)", nameEn: "Chemistry of Solutions", ponderation: "3-2-3", isCore: true, prerequisiteFor: "Préalable universitaire obligatoire" },
      { code: "101-NYA-05", nameFr: "Biologie : Évolution, diversité et écologie du vivant (00UK)", nameEn: "Evolution, Diversity and Ecology of Living Organisms", ponderation: "3-2-3", isCore: true, prerequisiteFor: "Préalable universitaire obligatoire" },
      { code: "420-SN1-RE", nameFr: "Programmation scientifique en Python (00UU)", nameEn: "Scientific Programming in Python", ponderation: "1-2-2", isCore: true },
      { code: "200-INT-RE", nameFr: "Activité d'intégration des apprentissages en sciences (Épreuve synthèse)", nameEn: "Comprehensive Assessment Project in Natural Sciences", ponderation: "1-2-3", isCore: true },
    ],
    leadsToProgramCategories: [
      { id: "sante_medecine", labelFr: "Médecine (MD), Pharmacie (Pharm.D.), Médecine dentaire (DMD), Optométrie, Médecine vétérinaire (DMV)", labelEn: "Doctor of Medicine (MD), Pharmacy (Pharm.D.), Dentistry (DMD), Optometry, Veterinary Medicine (DVM)" },
      { id: "sciences_sante_readaptation", labelFr: "Physiothérapie, Ergothérapie, Sciences infirmières, Nutrition, Audiologie, Orthophonie", labelEn: "Physiotherapy, Occupational Therapy, Nursing, Nutrition, Audiology, Speech Pathology" },
      { id: "genie_ingenierie", labelFr: "Génie logiciel, génie civil, génie mécanique, génie électrique, génie chimique, génie aérospatial", labelEn: "Software, Civil, Mechanical, Electrical, Chemical, and Aerospace Engineering" },
      { id: "informatique_donnees", labelFr: "Informatique, Intelligence artificielle, Science des données, Mathématiques actuarielles", labelEn: "Computer Science, Artificial Intelligence, Data Science, Actuarial Mathematics" },
      { id: "sciences_pures", labelFr: "Physique théorique et appliquée, Biochimie, Chimie des matériaux, Microbiologie, Mathématiques pures", labelEn: "Theoretical & Applied Physics, Biochemistry, Materials Chemistry, Microbiology, Pure Math" },
      { id: "architecture_environnement", labelFr: "Architecture, Agronomie, Foresterie, Géologie, Sciences de l'environnement", labelEn: "Architecture, Agronomy, Forestry, Geology, Environmental Sciences" },
    ],
    factualCareerExamples: [
      { titleFr: "Médecin (omnipraticien ou spécialiste) / Chirurgien", titleEn: "Physician (General or Specialist) / Surgeon", fieldFr: "Médecine & Santé", fieldEn: "Medicine & Health" },
      { titleFr: "Pharmacien (d'hôpital ou communautaire)", titleEn: "Pharmacist (Hospital or Community)", fieldFr: "Pharmacie", fieldEn: "Pharmacy" },
      { titleFr: "Ingénieur logiciel / Architecte de systèmes", titleEn: "Software Engineer / Systems Architect", fieldFr: "Génie logiciel & Informatique", fieldEn: "Software Engineering & Tech" },
      { titleFr: "Ingénieur (civil, mécanique, aérospatial, électrique)", titleEn: "Engineer (Civil, Mechanical, Aerospace, Electrical)", fieldFr: "Génie & Infrastructures", fieldEn: "Engineering & Infrastructure" },
      { titleFr: "Dentiste / Orthodontiste", titleEn: "Dentist / Orthodontist", fieldFr: "Médecine dentaire", fieldEn: "Dentistry" },
      { titleFr: "Actuaire certifié (FICA / FCAS)", titleEn: "Fellow of the Canadian Institute of Actuaries (FCIA)", fieldFr: "Actuariat & Gestion du risque", fieldEn: "Actuarial Science & Risk" },
      { titleFr: "Biochimiste / Chercheur en biotechnologies", titleEn: "Biochemist / Biotechnology Researcher", fieldFr: "Sciences biomédicales", fieldEn: "Biomedical Sciences" },
      { titleFr: "Physicien médical / Astrophysicien", titleEn: "Medical Physicist / Astrophysicist", fieldFr: "Physique fondamentale et médicale", fieldEn: "Fundamental & Medical Physics" },
      { titleFr: "Architecte agréé (OAQ)", titleEn: "Licensed Architect", fieldFr: "Architecture & Design", fieldEn: "Architecture & Design" },
    ],
    sourceUrl: "https://www.csfoy.ca/etudiants-actuels/services-aux-etudiants/aide-pedagogique/comprendre-la-grille-de-cours/",
    lastVerifiedAt: "2026-08-25",
  },
];

const PROFILE_BY_CODE = new Map(
  GENERIC_PROGRAM_PROFILES.map((p) => [p.programCode, p]),
);

export function findGenericProgramProfile(
  programCode: string | null | undefined,
): GenericProgramProfile | undefined {
  if (!programCode) return undefined;
  return PROFILE_BY_CODE.get(programCode);
}

export function getGenericProgramProfile(
  programCode: string | null | undefined,
): GenericProgramProfile | undefined {
  return findGenericProgramProfile(programCode);
}
