import { FAQ_CATEGORIES } from './faq.categories';
import { HelpFaqItem } from './faq.type';

export const MODULES_FAQ: HelpFaqItem[] = [
  {
    id: 'modules-access',
    category: FAQ_CATEGORIES.MODULES,
    question: "Comment accéder aux modules d'apprentissage ?",
    answer:
      'Rendez-vous sur la page Modules, choisissez un module, puis démarrez-le. Certains contenus peuvent nécessiter d’être connecté selon les options proposées.',
    tags: ['modules', 'apprentissage'],
  },
  {
    id: 'module-public-private',
    category: FAQ_CATEGORIES.MODULES,
    question: 'Quelle est la différence entre un module public et privé ?',
    answer:
      'Un module public est accessible à tous, tandis qu’un module privé peut être réservé à une organisation, un partenariat ou un accès spécifique.',
    tags: ['public', 'prive'],
  },
  {
    id: 'get-certificate',
    category: FAQ_CATEGORIES.MODULES,
    question: 'Comment obtenir un certificat ?',
    answer:
      'Terminez le module concerné (et ses évaluations si disponibles). Si la certification est activée, vous pourrez télécharger ou consulter votre certificat depuis votre espace.',
    tags: ['certificat', 'certification'],
  },
  {
    id: 'resume-module',
    category: FAQ_CATEGORIES.MODULES,
    question: 'Puis-je reprendre un module commencé ?',
    answer:
      'Oui. Votre progression est enregistrée automatiquement. Vous pouvez reprendre là où vous vous étiez arrêté depuis votre espace ou la liste des modules.',
    tags: ['progression', 'reprendre'],
  },
  {
    id: 'quiz-timing',
    category: FAQ_CATEGORIES.MODULES,
    question: 'Les quiz sont-ils limités en temps ?',
    answer:
      'Cela dépend du module. Certains quiz peuvent être chronométrés, d’autres non. Les règles (durée, tentatives) sont indiquées au lancement du quiz.',
    tags: ['quiz', 'temps'],
  },
];
