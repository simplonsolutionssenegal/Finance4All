// frontend/src/types/formations/module.ts

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum ModuleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export interface Module {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  thematics: string;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  status: ModuleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleData {
  title: string;
  description: string;
  imageUrl?: string | null;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  thematics: string;
}
