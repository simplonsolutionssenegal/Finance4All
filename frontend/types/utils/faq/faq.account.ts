import { FAQ_CATEGORIES } from './faq.categories';
import { HelpFaqItem } from './faq.type';

export const ACCOUNT_FAQ: HelpFaqItem[] = [
  {
    id: 'create-account',
    category: FAQ_CATEGORIES.ACCOUNT,
    question: 'Comment créer un compte sur Finance4All ?',
    answer:
      'Cliquez sur “Commencer gratuitement”, puis renseignez votre email, votre mot de passe et les informations demandées. Vous recevrez ensuite un email de confirmation si nécessaire.',
    tags: ['inscription', 'register', 'compte'],
  },
  {
    id: 'reset-password',
    category: FAQ_CATEGORIES.ACCOUNT,
    question: 'J’ai oublié mon mot de passe, que faire ?',
    answer:
      'Sur la page de connexion, sélectionnez “Mot de passe oublié” et suivez les étapes. Vous recevrez un lien de réinitialisation par email.',
    tags: ['password', 'connexion'],
  },
  {
    id: 'edit-profile',
    category: FAQ_CATEGORIES.ACCOUNT,
    question: 'Puis-je modifier mes informations personnelles ?',
    answer:
      'Oui. Une fois connecté, rendez-vous dans votre profil pour mettre à jour vos informations (nom, email, etc.). Certaines modifications peuvent nécessiter une vérification.',
    tags: ['profil', 'informations', 'compte'],
  },
  {
    id: 'delete-account',
    category: FAQ_CATEGORIES.ACCOUNT,
    question: 'Comment supprimer mon compte ?',
    answer:
      'Depuis votre espace, accédez aux paramètres du compte puis choisissez la suppression. Si l’option n’est pas disponible, contactez le support via le formulaire.',
    tags: ['suppression', 'compte'],
  },
];
