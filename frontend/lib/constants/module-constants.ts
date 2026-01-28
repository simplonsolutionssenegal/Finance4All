// frontend/src/lib/constants/module-constants.ts

import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';

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

export const MODULE_STATUS_LABELS: Record<ModuleStatus, string> = {
  [ModuleStatus.DRAFT]: 'Brouillon',
  [ModuleStatus.PUBLISHED]: 'Publié',
  [ModuleStatus.ARCHIVED]: 'Archivé',
};
export const MODULE_STATUS_COLORS: Record<ModuleStatus, string> = {
  [ModuleStatus.DRAFT]: 'bg-gray-100 text-gray-700',
  [ModuleStatus.PUBLISHED]: 'bg-green-100 text-green-700',
  [ModuleStatus.ARCHIVED]: 'bg-orange-100 text-orange-700',
};
