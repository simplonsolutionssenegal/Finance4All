// frontend/src/lib/constants/module-constants.ts

import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.BEGINNER]: 'Débutant',
  [DifficultyLevel.INTERMEDIATE]: 'Intermédiaire',
  [DifficultyLevel.ADVANCED]: 'Avancé',
  [DifficultyLevel.EXPERT]: 'Expert',
};

export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.BEGINNER]: 'bg-green-100 text-green-800 border border-green-300',
  [DifficultyLevel.INTERMEDIATE]: 'bg-blue-100 text-blue-800 border border-blue-300',
  [DifficultyLevel.ADVANCED]: 'bg-orange-100 text-orange-800 border border-orange-300',
  [DifficultyLevel.EXPERT]: 'bg-red-100 text-red-800 border border-red-300',
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
