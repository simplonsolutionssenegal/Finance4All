import { FAQ_CATEGORIES } from './faq.categories';
import { HelpFaqItem } from './faq.type';

export const SECURITY_FAQ: HelpFaqItem[] = [
  {
    id: 'security-data-protected',
    category: FAQ_CATEGORIES.SECURITY,
    question: 'Mes données personnelles sont-elles sécurisées ?',
    answer:
      'Oui. Nous appliquons des bonnes pratiques de sécurité (chiffrement des échanges, contrôles d’accès). Pour plus de détails, consultez la page Confidentialité.',
    tags: ['security', 'confidentialite'],
  },
  {
    id: 'security-learning-data-access',
    category: FAQ_CATEGORIES.SECURITY,
    question: "Qui a accès à mes données d'apprentissage ?",
    answer:
      'Seules les personnes autorisées (vous, et éventuellement votre organisation si vous y êtes rattaché) peuvent accéder à certaines données, selon les règles de confidentialité.',
    tags: ['acces', 'apprentissage'],
  },
  {
    id: 'security-data-usage',
    category: FAQ_CATEGORIES.SECURITY,
    question: 'Comment sont utilisées mes données ?',
    answer:
      'Vos données sont utilisées pour fournir le service (progression, personnalisation, support). Pour le détail, consultez la page Confidentialité.',
    tags: ['donnees', 'usage'],
  },
];
