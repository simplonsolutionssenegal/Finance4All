// frontend/src/lib/constants/module-constants.ts

import { DifficultyLevel, Thematic } from '@/types/modules/module';

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.BEGINNER]: 'Débutant',
  [DifficultyLevel.INTERMEDIATE]: 'Intermédiaire',
  [DifficultyLevel.ADVANCED]: 'Avancé',
  [DifficultyLevel.EXPERT]: 'Expert',
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.BEGINNER]: 'bg-green-100 text-green-800 hover:bg-green-100 ',
  [DifficultyLevel.INTERMEDIATE]: 'bg-blue-100 text-blue-800 hover:bg-blue-100 ',
  [DifficultyLevel.ADVANCED]: 'bg-orange-100 text-orange-800 hover:bg-orange-100 ',
  [DifficultyLevel.EXPERT]: 'bg-red-100 text-red-800 hover:bg-red-100 ',
};

export const THEMATIC_LABELS: Record<Thematic, string> = {
  [Thematic.FINANCIAL_EDUCATION]: 'Éducation financière',
  [Thematic.PERSONAL_DEVELOPMENT]: 'Développement personnel',
  [Thematic.FINANCIAL_LOAN]: 'Prêt financier',
  [Thematic.BANK_CREDIT]: 'Crédit bancaire',
  [Thematic.INVESTMENT]: 'Investissement',
  [Thematic.BUDGET_MANAGEMENT]: 'Gestion de budget',
  [Thematic.SAVING]: 'Épargne',
  [Thematic.ENTREPRENEURSHIP]: 'Entrepreneuriat',
  [Thematic.TAXATION]: 'Fiscalité',
  [Thematic.INSURANCE]: 'Assurance',
};

export const THEMATIC_ICONS: Record<Thematic, string> = {
  [Thematic.FINANCIAL_EDUCATION]: '📚',
  [Thematic.PERSONAL_DEVELOPMENT]: '🚀',
  [Thematic.FINANCIAL_LOAN]: '💰',
  [Thematic.BANK_CREDIT]: '🏦',
  [Thematic.INVESTMENT]: '📈',
  [Thematic.BUDGET_MANAGEMENT]: '💳',
  [Thematic.SAVING]: '🐷',
  [Thematic.ENTREPRENEURSHIP]: '💼',
  [Thematic.TAXATION]: '📊',
  [Thematic.INSURANCE]: '🛡️',
};
