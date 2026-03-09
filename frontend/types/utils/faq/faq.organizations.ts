import { FAQ_CATEGORIES } from './faq.categories';
import { HelpFaqItem } from './faq.type';

export const ORG_FAQ: HelpFaqItem[] = [
  {
    id: 'org-create-account',
    category: FAQ_CATEGORIES.ORG,
    question: 'Comment créer un compte organisation ?',
    answer:
      'Utilisez l’espace dédié aux organisations si disponible, ou contactez notre équipe via le formulaire pour activer et configurer votre organisation.',
    tags: ['organisation', 'compte'],
  },
  {
    id: 'org-manage-beneficiaries',
    category: FAQ_CATEGORIES.ORG,
    question: 'Comment gérer mes bénéficiaires ?',
    answer:
      'Depuis votre espace organisation, vous pouvez ajouter, modifier et suivre vos bénéficiaires selon les droits attribués aux membres de l’équipe.',
    tags: ['beneficiaires', 'gestion'],
  },
  {
    id: 'org-create-modules',
    category: FAQ_CATEGORIES.ORG,
    question: 'Puis-je créer mes propres modules ?',
    answer:
      'Oui, si la fonctionnalité est activée pour votre organisation. Vous pourrez créer et publier des modules selon votre rôle et vos permissions.',
    tags: ['modules', 'creation'],
  },
  {
    id: 'org-track-progress',
    category: FAQ_CATEGORIES.ORG,
    question: 'Comment suivre les progrès de mes bénéficiaires ?',
    answer:
      'Votre tableau de bord organisation vous permet de consulter les statistiques et l’avancement des bénéficiaires (selon vos droits).',
    tags: ['progres', 'dashboard'],
  },
];
