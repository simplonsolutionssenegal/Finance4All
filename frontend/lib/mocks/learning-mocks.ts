import {
  LessonStatus,
  QuizStatus,
  TypeQuestion,
  type Lesson,
  type LessonWithModuleContext,
  type Quiz,
  type Chapter,
  type LessonProgressStatus,
  type ChapterProgressStatus,
  type ChapterContent,
} from '@/types/learning/lesson';
import { DifficultyLevel, ModuleStatus, Thematic, type Module } from '@/types/modules/module';

export type { Chapter, ChapterContent } from '@/types/learning/lesson';

const moduleId = 'module-transferts-internationaux';

export const mockTransfertsInternationauxModule: Module = {
  id: moduleId,
  title: 'Transferts internationaux',
  description:
    "Découvrez comment envoyer de l'argent à l'international en toute sécurité et au meilleur tarif.",
  imageUrl: null,
  thematics: [Thematic.FINANCIAL_EDUCATION],
  difficultyLevel: DifficultyLevel.BEGINNER,
  estimatedDuration: 20,
  status: ModuleStatus.PUBLISHED,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockTransfertsLessons: Lesson[] = [
  {
    id: 'lesson-1',
    moduleId,
    title: 'Introduction aux transferts internationaux',
    description: 'Pourquoi et comment envoyer de l’argent à l’étranger.',
    duration: 5,
    order: 1,
    status: LessonStatus.PUBLISHED,
  },
  {
    id: 'lesson-2',
    moduleId,
    title: 'Comprendre les frais et les taux de change',
    description: 'Les éléments qui influencent le coût total de votre transfert.',
    duration: 7,
    order: 2,
    status: LessonStatus.PUBLISHED,
  },
  {
    id: 'lesson-3',
    moduleId,
    title: 'Transferts internationaux',
    description:
      "Découvrez comment envoyer de l'argent à l'international en toute sécurité et au meilleur tarif.",
    duration: 8,
    order: 3,
    status: LessonStatus.PUBLISHED,
  },
  {
    id: 'lesson-4',
    moduleId,
    title: 'Suivre et sécuriser vos opérations',
    description: 'Les bonnes pratiques pour éviter les fraudes.',
    duration: 6,
    order: 4,
    status: LessonStatus.PUBLISHED,
  },
];

// Quiz du chapitre (fin de lesson-1, chapitre "Les différents moyens de transfert")
const quizChapterLesson1: Quiz = {
  id: 'quiz-lesson-1-chapitre',
  moduleId,
  lessonId: 'lesson-1',
  chapterId: 'lesson-1-ch-2',
  title: 'Quiz : Les moyens de transfert',
  description:
    'Vérifiez que vous connaissez les différents moyens d’envoyer de l’argent à l’étranger.',
  status: QuizStatus.PUBLISHED,
  scoreMinimum: 70,
  duree: 10,
  nombreTentatives: 3,
  questions: [
    {
      question:
        'Quel moyen de transfert est généralement le plus sécurisé mais souvent plus lent ?',
      type: TypeQuestion.CHOIX_UNIQUE,
      points: 10,
      options: [
        { text: 'Virement bancaire', isCorrect: true },
        { text: 'Portefeuille numérique', isCorrect: false },
        { text: 'Envoi d’espèces par courrier', isCorrect: false },
      ],
      explication:
        'Le virement bancaire passe par le circuit bancaire officiel, ce qui le rend très sécurisé.',
    },
    {
      question:
        'Parmi les options suivantes, lesquelles sont des moyens de transfert international ?',
      type: TypeQuestion.CHOIX_MULTIPLE,
      points: 10,
      options: [
        { text: 'Virement bancaire', isCorrect: true },
        { text: 'Services de transfert d’argent (Western Union, etc.)', isCorrect: true },
        { text: 'Portefeuilles numériques (Orange Money, etc.)', isCorrect: true },
        { text: 'Envoi de billets par la poste', isCorrect: false },
      ],
      explication:
        'Les trois premiers sont des moyens courants et réglementés pour transférer de l’argent à l’international.',
    },
  ],
};

// Quiz de la leçon 2 (frais et taux de change)
const quizLesson2: Quiz = {
  id: 'quiz-lesson-2',
  moduleId,
  lessonId: 'lesson-2',
  chapterId: null,
  title: 'Quiz : Frais et taux de change',
  description:
    'Vérifiez que vous savez calculer le coût total d’un transfert (frais, taux de change).',
  status: QuizStatus.PUBLISHED,
  scoreMinimum: 70,
  duree: 15,
  nombreTentatives: 3,
  questions: [
    {
      question: 'Les frais de transfert peuvent être :',
      type: TypeQuestion.CHOIX_UNIQUE,
      points: 5,
      options: [
        { text: 'Uniquement fixes', isCorrect: false },
        { text: 'Fixes ou variables (pourcentage)', isCorrect: true },
        { text: 'Uniquement variables', isCorrect: false },
      ],
      explication:
        'Les opérateurs proposent souvent des frais fixes, variables, ou une combinaison des deux.',
    },
    {
      question: 'Que doit-on comparer pour choisir le meilleur transfert ?',
      type: TypeQuestion.CHOIX_MULTIPLE,
      points: 10,
      options: [
        { text: 'Le montant des frais affichés', isCorrect: true },
        { text: 'Le montant réellement reçu par le destinataire', isCorrect: true },
        { text: 'Uniquement la rapidité', isCorrect: false },
      ],
      explication:
        'Le coût total et le montant reçu sont les critères essentiels ; la rapidité peut aussi compter.',
    },
    {
      question: 'Le taux de change proposé par l’opérateur est souvent :',
      type: TypeQuestion.CHOIX_UNIQUE,
      points: 5,
      options: [
        { text: 'Identique au taux du marché', isCorrect: false },
        { text: 'Légèrement moins avantageux que le taux du marché', isCorrect: true },
        { text: 'Toujours plus avantageux', isCorrect: false },
      ],
      explication: 'Les opérateurs appliquent généralement une marge sur le taux de change.',
    },
  ],
};

// Quiz final du module (après toutes les leçons)
const quizModuleFinal: Quiz = {
  id: 'quiz-module-final',
  moduleId,
  lessonId: 'lesson-4',
  chapterId: null,
  isModuleQuiz: true,
  title: 'Évaluation finale: Transferts internationaux',
  description: 'Validez votre maîtrise des transferts internationaux (sécurité, frais, suivi).',
  status: QuizStatus.PUBLISHED,
  scoreMinimum: 70,
  duree: 20,
  nombreTentatives: 3,
  questions: [
    {
      question: 'Quelle est la première chose à faire en cas de problème avec un transfert ?',
      type: TypeQuestion.CHOIX_UNIQUE,
      points: 20,
      options: [
        { text: 'Contacter le service client avec le numéro de référence', isCorrect: true },
        { text: 'Envoyer un nouveau transfert', isCorrect: false },
        { text: 'Attendre plusieurs jours sans rien faire', isCorrect: false },
      ],
      explication:
        'Le service client peut suivre votre dossier avec le numéro de référence du transfert.',
    },
    {
      question: 'Pour se protéger des fraudes, il faut :',
      type: TypeQuestion.CHOIX_MULTIPLE,
      points: 20,
      options: [
        { text: 'Ne jamais partager ses codes PIN ou mots de passe', isCorrect: true },
        { text: 'Vérifier que le site utilise HTTPS', isCorrect: true },
        { text: 'Se méfier des offres trop avantageuses', isCorrect: true },
        { text: 'Utiliser uniquement le Wi-Fi public', isCorrect: false },
      ],
      explication:
        'La sécurité repose sur la confidentialité des identifiants et une vigilance sur les offres et les sites.',
    },
  ],
};

/** Tous les quiz du module (chapitre, leçon, module). Pour l’affichage bénéficiaire, on ne retourne que les PUBLISHED. */
export const mockModuleQuizzes: Quiz[] = [quizChapterLesson1, quizLesson2, quizModuleFinal];

/** Quiz legacy (un seul) pour compatibilité ; préférer getQuizzesForModule. */
export const mockTransfertsQuiz: Quiz = quizModuleFinal;

// Chapitres par leçon (structure proche de l'API cible)
export const mockLessonChapters: Record<string, Chapter[]> = {
  'lesson-1': [
    {
      id: 'lesson-1-ch-0',
      lessonId: 'lesson-1',
      title: 'Qu’est-ce qu’un transfert international ?',
      description: 'Définition et contexte des transferts d’argent à l’international.',
      mediaId: 'media-lesson1-ch0',
      order: 0,
    },
    {
      id: 'lesson-1-ch-1',
      lessonId: 'lesson-1',
      title: 'Pourquoi envoyer de l’argent à l’étranger ?',
      description:
        'Les principales raisons et situations qui nécessitent un transfert international.',
      mediaId: 'media-lesson1-ch1',
      order: 1,
    },
    {
      id: 'lesson-1-ch-2',
      lessonId: 'lesson-1',
      title: 'Les différents moyens de transfert',
      description: 'Virement bancaire, services de transfert d’argent, portefeuilles numériques.',
      mediaId: 'media-lesson1-ch2',
      order: 2,
    },
  ],
  'lesson-2': [
    {
      id: 'lesson-2-ch-0',
      lessonId: 'lesson-2',
      title: 'Comprendre les frais de transfert',
      description: 'Les différents types de frais : fixes, variables, frais cachés.',
      mediaId: 'media-lesson2-ch0',
      order: 0,
    },
    {
      id: 'lesson-2-ch-1',
      lessonId: 'lesson-2',
      title: 'Le taux de change expliqué',
      description: 'Comment fonctionne le taux de change et son impact sur votre transfert.',
      mediaId: 'media-lesson2-ch1',
      order: 1,
    },
    {
      id: 'lesson-2-ch-2',
      lessonId: 'lesson-2',
      title: 'Calculer le coût total',
      description: 'Méthode pour calculer le montant total à débiter et le montant reçu.',
      mediaId: 'media-lesson2-ch2',
      order: 2,
    },
    {
      id: 'lesson-2-ch-3',
      lessonId: 'lesson-2',
      title: 'Comparer les offres',
      description: 'Comment utiliser notre comparateur pour trouver le meilleur tarif.',
      mediaId: 'media-lesson2-ch3',
      order: 3,
    },
  ],
  'lesson-3': [
    {
      id: 'lesson-3-ch-0',
      lessonId: 'lesson-3',
      title: 'Introduction : Pourquoi réduire ses dépenses ?',
      description:
        "Comprendre l'importance de la gestion intelligente de son budget et les bénéfices à long terme d'une réduction maîtrisée des dépenses.",
      mediaId: 'media-intro-001',
      order: 0,
    },
    {
      id: 'lesson-3-ch-1',
      lessonId: 'lesson-3',
      title: 'Analyser ses dépenses actuelles',
      description:
        'Apprendre à identifier où va votre argent : catégoriser vos dépenses, utiliser des outils de suivi, et repérer les postes de dépenses superflus.',
      mediaId: 'media-analyse-002',
      order: 1,
    },
    {
      id: 'lesson-3-ch-2',
      lessonId: 'lesson-3',
      title: 'Les dépenses incompressibles vs évitables',
      description:
        'Faire la distinction entre les dépenses essentielles (loyer, alimentation, santé) et celles qui peuvent être réduites ou éliminées sans impact majeur.',
      mediaId: 'media-distinction-003',
      order: 2,
    },
    {
      id: 'lesson-3-ch-3',
      lessonId: 'lesson-3',
      title: "Astuces pour l'alimentation",
      description:
        'Réduire le budget alimentaire : planifier les repas, acheter en gros, cuisiner maison, éviter le gaspillage, et profiter des promotions intelligemment.',
      mediaId: 'media-alimentation-004',
      order: 3,
    },
    {
      id: 'lesson-3-ch-4',
      lessonId: 'lesson-3',
      title: 'Optimiser ses abonnements et forfaits',
      description:
        'Revoir tous vos abonnements : comparer les offres, négocier, et éliminer les services inutilisés.',
      mediaId: 'media-abonnements-005',
      order: 4,
    },
    {
      id: 'lesson-3-ch-5',
      lessonId: 'lesson-3',
      title: 'Transport et déplacements',
      description:
        'Réduire les coûts de transport : covoiturage, transports en commun, optimisation des trajets, entretien préventif du véhicule.',
      mediaId: 'media-transport-006',
      order: 5,
    },
    {
      id: 'lesson-3-ch-6',
      lessonId: 'lesson-3',
      title: 'Énergie et logement',
      description:
        "Diminuer les factures d'électricité et d'eau : gestes simples, investissements rentables et choix du bon fournisseur.",
      mediaId: 'media-energie-007',
      order: 6,
    },
    {
      id: 'lesson-3-ch-7',
      lessonId: 'lesson-3',
      title: 'Loisirs et sorties à petit budget',
      description:
        'Profiter de la vie sans se ruiner : activités gratuites ou peu coûteuses, bons plans culturels, alternatives aux sorties onéreuses.',
      mediaId: 'media-loisirs-008',
      order: 7,
    },
    {
      id: 'lesson-3-ch-8',
      lessonId: 'lesson-3',
      title: 'La règle des 24 heures',
      description:
        'Éviter les achats impulsifs : attendre 24 heures, technique de la liste d’envies, distinguer besoins et désirs.',
      mediaId: 'media-regle24h-009',
      order: 8,
    },
    {
      id: 'lesson-3-ch-9',
      lessonId: 'lesson-3',
      title: "Plan d'action personnalisé",
      description:
        'Créer votre stratégie de réduction des dépenses : fixer des objectifs réalistes, suivre vos progrès et célébrer les petites victoires.',
      mediaId: 'media-plan-010',
      order: 9,
    },
  ],
  'lesson-4': [
    {
      id: 'lesson-4-ch-0',
      lessonId: 'lesson-4',
      title: 'Suivre votre transfert en temps réel',
      description:
        'Comment utiliser les outils de suivi pour connaître le statut de votre transfert.',
      mediaId: 'media-lesson4-ch0',
      order: 0,
    },
    {
      id: 'lesson-4-ch-1',
      lessonId: 'lesson-4',
      title: 'Les signes de fraude à reconnaître',
      description: 'Identifier les arnaques courantes et les sites frauduleux.',
      mediaId: 'media-lesson4-ch1',
      order: 1,
    },
    {
      id: 'lesson-4-ch-2',
      lessonId: 'lesson-4',
      title: 'Protéger vos informations personnelles',
      description: 'Bonnes pratiques pour sécuriser vos données lors d’un transfert.',
      mediaId: 'media-lesson4-ch2',
      order: 2,
    },
    {
      id: 'lesson-4-ch-3',
      lessonId: 'lesson-4',
      title: 'Que faire en cas de problème ?',
      description: 'Les démarches à suivre si votre transfert rencontre un problème.',
      mediaId: 'media-lesson4-ch3',
      order: 3,
    },
  ],
};

// Contenu détaillé de chaque chapitre
export const mockChapterContents: Record<string, ChapterContent> = {
  'lesson-3-ch-0': {
    chapterId: 'lesson-3-ch-0',
    keyPoint: {
      title: 'Point clé',
      description:
        "Réduire ses dépenses ne signifie pas sacrifier sa qualité de vie. Il s'agit de dépenser intelligemment et de prioriser ce qui compte vraiment pour vous.",
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Identifiez vos dépenses mensuelles récurrentes et catégorisez-les.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Distinguer les dépenses essentielles des dépenses optionnelles.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Fixez-vous un objectif de réduction réaliste (par exemple, 10-15%).',
      },
      {
        number: 4,
        title: 'Étape 4',
        description: 'Appliquez des stratégies ciblées sur chaque catégorie de dépenses.',
      },
    ],
    practicalExample: {
      title: 'Exemple pratique',
      situation: 'Vous dépensez 100 000 FCFA par mois en courses alimentaires.',
      details: [
        { label: 'Budget actuel', value: '100 000 FCFA' },
        { label: 'Objectif de réduction (15%)', value: '15 000 FCFA' },
        { label: 'Nouveau budget mensuel', value: '85 000 FCFA', highlight: true },
        { label: 'Économie annuelle', value: '180 000 FCFA', highlight: true },
      ],
    },
  },
  'lesson-3-ch-1': {
    chapterId: 'lesson-3-ch-1',
    keyPoint: {
      title: 'Point clé',
      description:
        'La première étape pour réduire ses dépenses est de savoir exactement où va votre argent. Sans cette visibilité, impossible de faire des économies efficaces.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Conservez tous vos tickets et relevés pendant un mois complet.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description:
          'Classez vos dépenses par catégories (alimentation, transport, loisirs, etc.).',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Utilisez une application de suivi budgétaire ou un simple tableau Excel.',
      },
      {
        number: 4,
        title: 'Étape 4',
        description:
          'Identifiez les postes de dépenses les plus importants et les plus surprenants.',
      },
    ],
  },
  'lesson-3-ch-2': {
    chapterId: 'lesson-3-ch-2',
    keyPoint: {
      title: 'Point clé',
      description:
        'Les dépenses essentielles (loyer, alimentation de base, santé) ne peuvent généralement pas être réduites facilement. Concentrez-vous sur les dépenses évitables.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Listez toutes vos dépenses mensuelles.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Marquez chaque dépense comme "essentielle" ou "évitable".',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Pour les dépenses évitables, évaluez leur impact réel sur votre bonheur.',
      },
      {
        number: 4,
        title: 'Étape 4',
        description: 'Éliminez ou réduisez celles qui n’apportent pas de valeur significative.',
      },
    ],
  },
  'lesson-1-ch-0': {
    chapterId: 'lesson-1-ch-0',
    keyPoint: {
      title: 'Point clé',
      description:
        'Un transfert international est une opération qui permet d’envoyer de l’argent d’un pays vers un autre, généralement pour soutenir sa famille, payer des services ou investir.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Un transfert international implique deux devises différentes.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description:
          'Il nécessite un opérateur de transfert (banque, service spécialisé, portefeuille numérique).',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Le destinataire reçoit l’argent dans sa devise locale.',
      },
    ],
  },
  'lesson-2-ch-0': {
    chapterId: 'lesson-2-ch-0',
    keyPoint: {
      title: 'Point clé',
      description:
        'Les frais de transfert peuvent être fixes (montant unique) ou variables (pourcentage du montant). Comparez toujours le coût total, pas seulement les frais.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Vérifiez si les frais sont fixes ou variables.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description:
          'Demandez s’il y a des frais cachés (frais de réception, frais de conversion).',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Calculez le montant total à débiter et le montant reçu.',
      },
    ],
    practicalExample: {
      title: 'Exemple pratique',
      situation: 'Vous voulez envoyer 50 000 FCFA du Sénégal vers le Cameroun.',
      details: [
        { label: 'Montant à envoyer', value: '50 000 FCFA' },
        { label: 'Frais de transfert (1%)', value: '500 FCFA' },
        { label: 'Total à débiter', value: '50 500 FCFA' },
        { label: 'Montant reçu', value: '50 000 FCFA', highlight: true },
      ],
    },
  },
  'lesson-4-ch-0': {
    chapterId: 'lesson-4-ch-0',
    keyPoint: {
      title: 'Point clé',
      description:
        'Le suivi en temps réel vous permet de savoir exactement où en est votre transfert et d’anticiper la réception par le destinataire.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Conservez votre numéro de référence de transfert.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description:
          'Utilisez l’application ou le site web de votre opérateur pour suivre le statut.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description:
          'Vérifiez régulièrement les mises à jour jusqu’à la confirmation de réception.',
      },
    ],
  },
  // Contenu pour les autres chapitres de lesson-1
  'lesson-1-ch-1': {
    chapterId: 'lesson-1-ch-1',
    keyPoint: {
      title: 'Point clé',
      description:
        'Les transferts internationaux répondent à des besoins variés : soutien familial, paiement de services, investissements ou urgences.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description:
          'Identifiez votre besoin : soutien familial, paiement, investissement ou urgence.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Évaluez la fréquence de vos transferts (ponctuel ou régulier).',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Choisissez le service adapté à votre situation.',
      },
    ],
  },
  'lesson-1-ch-2': {
    chapterId: 'lesson-1-ch-2',
    keyPoint: {
      title: 'Point clé',
      description:
        'Chaque moyen de transfert a ses avantages et inconvénients. Le choix dépend de vos besoins spécifiques.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Virement bancaire : sécurisé mais souvent plus lent et coûteux.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description:
          'Services spécialisés : rapides et souvent moins chers, adaptés aux petits montants.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description:
          'Portefeuilles numériques : pratiques pour les transferts fréquents et petits montants.',
      },
    ],
  },
  // Contenu pour les autres chapitres de lesson-2
  'lesson-2-ch-1': {
    chapterId: 'lesson-2-ch-1',
    keyPoint: {
      title: 'Point clé',
      description:
        'Le taux de change détermine combien votre destinataire recevra réellement. Un taux défavorable peut réduire significativement le montant reçu.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Vérifiez le taux de change proposé par l’opérateur.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Comparez avec le taux du marché pour identifier les écarts.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Choisissez le moment optimal si possible (les taux varient quotidiennement).',
      },
    ],
  },
  'lesson-2-ch-2': {
    chapterId: 'lesson-2-ch-2',
    keyPoint: {
      title: 'Point clé',
      description:
        'Le coût total comprend les frais de transfert ET la différence de taux de change. Calculez toujours le montant réellement reçu.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Additionnez les frais fixes et variables.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Appliquez le taux de change pour connaître le montant reçu.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Comparez le coût total entre différents opérateurs.',
      },
    ],
    practicalExample: {
      title: 'Exemple pratique',
      situation: 'Vous envoyez 100 000 FCFA vers la France (EUR).',
      details: [
        { label: 'Montant à envoyer', value: '100 000 FCFA' },
        { label: 'Frais (2%)', value: '2 000 FCFA' },
        { label: 'Taux de change', value: '655 FCFA = 1 EUR' },
        { label: 'Montant reçu', value: '149,62 EUR', highlight: true },
      ],
    },
  },
  'lesson-2-ch-3': {
    chapterId: 'lesson-2-ch-3',
    keyPoint: {
      title: 'Point clé',
      description:
        'Notre comparateur vous permet de voir en un coup d’œil tous les opérateurs disponibles, leurs frais et le montant réellement reçu.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Entrez le montant à envoyer et le pays de destination.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Consultez les résultats triés par coût total ou rapidité.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Sélectionnez l’offre qui correspond le mieux à vos besoins.',
      },
    ],
  },
  // Contenu pour les autres chapitres de lesson-3 (déjà créés pour ch-0, ch-1, ch-2)
  'lesson-3-ch-3': {
    chapterId: 'lesson-3-ch-3',
    keyPoint: {
      title: 'Point clé',
      description:
        'L’alimentation représente souvent le deuxième poste de dépenses après le logement. Des économies significatives sont possibles sans sacrifier la qualité.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Planifiez vos repas de la semaine et établissez une liste de courses.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Achetez en gros les produits non périssables et profitez des promotions.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Cuisinez maison plutôt que d’acheter des plats préparés.',
      },
      {
        number: 4,
        title: 'Étape 4',
        description:
          'Évitez le gaspillage en utilisant les restes et en conservant correctement les aliments.',
      },
    ],
  },
  'lesson-3-ch-4': {
    chapterId: 'lesson-3-ch-4',
    keyPoint: {
      title: 'Point clé',
      description:
        'Les abonnements s’accumulent souvent sans qu’on s’en rende compte. Un audit régulier permet d’économiser des centaines de milliers de FCFA par an.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description:
          'Listez tous vos abonnements (téléphone, internet, streaming, salle de sport, etc.).',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Évaluez l’utilisation réelle de chaque service.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Résiliez ceux que vous n’utilisez plus ou négociez des tarifs réduits.',
      },
    ],
  },
  'lesson-3-ch-5': {
    chapterId: 'lesson-3-ch-5',
    keyPoint: {
      title: 'Point clé',
      description:
        'Le transport peut représenter jusqu’à 20% du budget mensuel. Optimiser ce poste libère un budget conséquent.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Privilégiez les transports en commun pour les trajets réguliers.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Organisez le covoiturage pour les longs trajets.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Optimisez vos trajets pour réduire la distance totale parcourue.',
      },
      {
        number: 4,
        title: 'Étape 4',
        description:
          'Entretenez préventivement votre véhicule pour éviter les grosses réparations.',
      },
    ],
  },
  'lesson-3-ch-6': {
    chapterId: 'lesson-3-ch-6',
    keyPoint: {
      title: 'Point clé',
      description:
        'Les factures d’énergie peuvent être réduites de 15 à 30% avec des gestes simples et quelques investissements rentables.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description:
          'Éteignez les appareils en veille et utilisez des multiprises avec interrupteur.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Remplacez les ampoules classiques par des LED.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Comparez les offres des fournisseurs d’énergie et changez si nécessaire.',
      },
    ],
  },
  'lesson-3-ch-7': {
    chapterId: 'lesson-3-ch-7',
    keyPoint: {
      title: 'Point clé',
      description:
        'Les loisirs ne doivent pas être sacrifiés, mais il existe de nombreuses alternatives gratuites ou peu coûteuses tout aussi enrichissantes.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description:
          'Explorez les activités gratuites dans votre ville (parcs, musées gratuits, événements).',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Profitez des réductions étudiant, senior ou des offres promotionnelles.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Organisez des activités à la maison (soirées jeux, cinéma maison, etc.).',
      },
    ],
  },
  'lesson-3-ch-8': {
    chapterId: 'lesson-3-ch-8',
    keyPoint: {
      title: 'Point clé',
      description:
        'Les achats impulsifs représentent souvent 10 à 20% des dépenses mensuelles. La règle des 24 heures permet de les éviter efficacement.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description:
          'Quand vous avez envie d’acheter quelque chose de non essentiel, attendez 24 heures.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description:
          'Pendant ce délai, évaluez si cet achat répond à un besoin réel ou à un désir passager.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Si après 24h vous en avez toujours besoin, alors l’achat est justifié.',
      },
    ],
  },
  'lesson-3-ch-9': {
    chapterId: 'lesson-3-ch-9',
    keyPoint: {
      title: 'Point clé',
      description:
        'Un plan d’action personnalisé et réaliste augmente vos chances de succès. Fixez des objectifs progressifs et célébrez chaque étape.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description:
          'Fixez-vous un objectif de réduction global (ex: 10% des dépenses mensuelles).',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Répartissez cet objectif sur les différentes catégories de dépenses.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Suivez vos progrès mensuellement et ajustez si nécessaire.',
      },
      {
        number: 4,
        title: 'Étape 4',
        description: 'Célébrez les petites victoires pour maintenir votre motivation.',
      },
    ],
  },
  // Contenu pour les autres chapitres de lesson-4
  'lesson-4-ch-1': {
    chapterId: 'lesson-4-ch-1',
    keyPoint: {
      title: 'Point clé',
      description:
        'Les fraudeurs utilisent des techniques sophistiquées. Reconnaître les signes d’alerte vous protège efficacement.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description:
          'Méfiez-vous des offres trop belles pour être vraies (frais très bas, taux de change exceptionnel).',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Vérifiez que le site web utilise HTTPS et que l’URL est correcte.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description:
          'Ne jamais partager vos codes PIN ou mots de passe, même si on vous le demande.',
      },
    ],
  },
  'lesson-4-ch-2': {
    chapterId: 'lesson-4-ch-2',
    keyPoint: {
      title: 'Point clé',
      description:
        'Vos informations personnelles valent de l’or pour les fraudeurs. Protégez-les comme vous protégeriez votre argent liquide.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description: 'Utilisez des mots de passe forts et uniques pour chaque compte.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Activez l’authentification à deux facteurs quand c’est possible.',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Ne faites jamais de transferts depuis un réseau Wi-Fi public non sécurisé.',
      },
    ],
  },
  'lesson-4-ch-3': {
    chapterId: 'lesson-4-ch-3',
    keyPoint: {
      title: 'Point clé',
      description:
        'En cas de problème, agissez rapidement. Plus vous réagissez tôt, plus les chances de résolution sont élevées.',
    },
    steps: [
      {
        number: 1,
        title: 'Étape 1',
        description:
          'Contactez immédiatement le service client de votre opérateur avec votre numéro de référence.',
      },
      {
        number: 2,
        title: 'Étape 2',
        description: 'Conservez tous les documents (reçus, emails, captures d’écran).',
      },
      {
        number: 3,
        title: 'Étape 3',
        description: 'Si nécessaire, portez plainte auprès des autorités compétentes.',
      },
    ],
  },
};

// Fonction pour récupérer le contenu d'un chapitre
export function getChapterContent(chapterId: string): ChapterContent | null {
  return mockChapterContents[chapterId] ?? null;
}

// Fonction pour obtenir le chapitre actif par défaut (le premier CURRENT ou le premier DONE)
export function getDefaultChapterId(lessonId: string): string | null {
  const chapters = getChaptersForLesson(lessonId);
  if (chapters.length === 0) return null;

  // Chercher le premier chapitre CURRENT
  const current = chapters.find(ch => getChapterStatus(ch.lessonId, ch.order) === 'CURRENT');
  if (current) return current.id;

  // Sinon, chercher le premier chapitre DONE
  const done = chapters.find(ch => getChapterStatus(ch.lessonId, ch.order) === 'DONE');
  if (done) return done.id;

  // Sinon, retourner le premier chapitre (LOCKED mais on l'affiche quand même)
  return chapters[0]?.id ?? null;
}

// Mock de progression bénéficiaire sur le module
export const mockModuleProgress = {
  moduleId,
  completedLessons: 1, // leçon 1 terminée
  currentLessonOrder: 2, // leçon 2 en cours
  completedChaptersByLessonId: {
    'lesson-1': 2, // tous les chapitres de la leçon 1 terminés
    'lesson-2': 0, // premier chapitre de la leçon 2 en cours
    'lesson-3': 1, // chapitres 0 et 1 terminés, chapitre 2 en cours
    'lesson-4': -1, // aucun chapitre commencé
  } as Record<string, number>, // valeur = dernier order terminé
};

export function getLessonContextByOrder(order: number): LessonWithModuleContext | null {
  const sorted = [...mockTransfertsLessons].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex(l => l.order === order);

  if (index === -1) return null;

  return {
    moduleId,
    moduleTitle: mockTransfertsInternationauxModule.title,
    currentLesson: sorted[index],
    currentIndex: index,
    totalLessons: sorted.length,
  };
}

export function getLessonByOrder(order: number): Lesson | null {
  return mockTransfertsLessons.find(l => l.order === order) ?? null;
}

export function getLessonStatus(order: number): LessonProgressStatus {
  if (order <= mockModuleProgress.completedLessons) return 'DONE';
  if (order === mockModuleProgress.currentLessonOrder) return 'CURRENT';
  return 'LOCKED';
}

export function getChaptersForLesson(lessonId: string): Chapter[] {
  const list = mockLessonChapters[lessonId] ?? [];
  return [...list].sort((a, b) => a.order - b.order);
}

/** Retourne les quiz publiés du module pour l’affichage bénéficiaire (sans bouton « Nouveau quiz »). */
export function getQuizzesForModule(moduleIdParam: string): Quiz[] {
  if (moduleIdParam !== moduleId) return [];
  return mockModuleQuizzes.filter(q => q.status === QuizStatus.PUBLISHED);
}

/** Retourne un quiz par id pour un module donné, ou null. */
export function getQuizById(moduleIdParam: string, quizIdParam: string): Quiz | null {
  if (moduleIdParam !== moduleId) return null;
  return mockModuleQuizzes.find(q => q.id === quizIdParam) ?? null;
}

/** Retourne le quiz publié associé à un chapitre, ou null. */
export function getQuizForChapter(moduleIdParam: string, chapterIdParam: string): Quiz | null {
  if (moduleIdParam !== moduleId) return null;
  return (
    mockModuleQuizzes.find(
      q => q.status === QuizStatus.PUBLISHED && q.chapterId === chapterIdParam
    ) ?? null
  );
}

export interface QuizAvailability {
  available: boolean;
  reason?: string;
}

/**
 * Indique si un quiz est disponible selon la progression.
 * - Quiz chapitre (chapterId défini) : disponible dès qu’on entre dans le chapitre (CURRENT ou DONE).
 * - Quiz leçon (sans chapterId, pas isModuleQuiz) : disponible quand tous les chapitres de la leçon sont terminés.
 * - Quiz module (isModuleQuiz) : disponible quand toutes les leçons sont terminées.
 */
export function getQuizAvailability(quiz: Quiz, totalLessons: number): QuizAvailability {
  const progress = mockModuleProgress;

  if (quiz.chapterId) {
    const chapters = getChaptersForLesson(quiz.lessonId);
    const chapter = chapters.find(ch => ch.id === quiz.chapterId);
    if (!chapter) return { available: false, reason: 'Chapitre introuvable.' };
    const status = getChapterStatus(quiz.lessonId, chapter.order);
    if (status === 'LOCKED') {
      return {
        available: false,
        reason: 'Terminez les chapitres précédents pour débloquer ce quiz.',
      };
    }
    return { available: true };
  }

  if (quiz.isModuleQuiz) {
    if (progress.completedLessons < totalLessons) {
      return {
        available: false,
        reason: 'Terminez toutes les leçons du module pour débloquer ce quiz.',
      };
    }
    return { available: true };
  }

  const chapters = getChaptersForLesson(quiz.lessonId);
  if (chapters.length === 0) return { available: true };
  const lastChapterOrder = Math.max(...chapters.map(ch => ch.order));
  const completed = progress.completedChaptersByLessonId[quiz.lessonId] ?? -1;
  if (completed < lastChapterOrder) {
    return {
      available: false,
      reason: 'Terminez tous les chapitres de la leçon pour débloquer ce quiz.',
    };
  }
  return { available: true };
}

export function getChapterStatus(lessonId: string, order: number): ChapterProgressStatus {
  const lastCompleted = mockModuleProgress.completedChaptersByLessonId[lessonId] ?? -1;

  if (order <= lastCompleted) return 'DONE';
  if (order === lastCompleted + 1) return 'CURRENT';
  return 'LOCKED';
}

/**
 * Marque une leçon comme terminée (ex. après succès du quiz de leçon).
 * Met à jour la progression mock pour débloquer la leçon suivante.
 */
export function markLessonCompleted(lessonIdParam: string): void {
  const lesson = mockTransfertsLessons.find(l => l.id === lessonIdParam);
  if (!lesson) return;
  if (mockModuleProgress.completedLessons >= lesson.order) return;
  mockModuleProgress.completedLessons = lesson.order;
  mockModuleProgress.currentLessonOrder = lesson.order + 1;
}

/**
 * Calcule l’URL de redirection après succès d’un quiz (score >= scoreMinimum).
 * - Quiz chapitre : vers le chapitre suivant ou détail module si plus de chapitre.
 * - Quiz leçon : vers détail module (avec ?lessonCompleted= pour débloquer la leçon suivante).
 * - Quiz module : vers détail module.
 */
export function getAfterQuizSuccessRedirect(moduleIdParam: string, quiz: Quiz): string {
  const base = `/learning/${moduleIdParam}`;
  if (quiz.isModuleQuiz) return base;

  if (quiz.chapterId) {
    const chapters = getChaptersForLesson(quiz.lessonId);
    const idx = chapters.findIndex(ch => ch.id === quiz.chapterId);
    if (idx >= 0 && idx + 1 < chapters.length) {
      const nextChapter = chapters[idx + 1];
      const lesson = mockTransfertsLessons.find(l => l.id === quiz.lessonId);
      if (lesson) return `${base}/lesson/${lesson.order}?chapter=${nextChapter.id}`;
    }
    return base;
  }

  return `${base}?lessonCompleted=${quiz.lessonId}`;
}
