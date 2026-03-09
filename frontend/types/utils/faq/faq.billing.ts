import { FAQ_CATEGORIES } from './faq.categories';
import { HelpFaqItem } from './faq.type';

export const BILLING_FAQ: HelpFaqItem[] = [
  {
    id: 'billing-free',
    category: FAQ_CATEGORIES.BILLING,
    question: 'Finance4All est-il gratuit ?',
    answer:
      'Une partie des fonctionnalités est gratuite. Certaines offres ou services peuvent être payants selon les options et partenariats.',
    tags: ['facturation', 'gratuit'],
  },
  {
    id: 'billing-methods',
    category: FAQ_CATEGORIES.BILLING,
    question: 'Quels sont les moyens de paiement acceptés ?',
    answer:
      'Les moyens de paiement disponibles dépendent de votre pays et de l’offre. Les options proposées s’affichent au moment du paiement.',
    tags: ['paiement', 'moyens'],
  },
  {
    id: 'billing-invoice',
    category: FAQ_CATEGORIES.BILLING,
    question: 'Puis-je obtenir une facture ?',
    answer:
      'Oui. Si la facturation est activée pour votre offre, vous pouvez télécharger vos factures depuis votre espace. Sinon, contactez le support.',
    tags: ['facture', 'invoice'],
  },
];
