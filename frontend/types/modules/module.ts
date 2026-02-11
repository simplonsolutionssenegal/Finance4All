// frontend/src/types/formations/module.ts

import type { Lesson } from './Lesson';
import type { Quiz } from './Quiz';

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
  thematics: string;
  imageMediaId: string | null;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  lessons: Lesson[];
  quizzes: Quiz[];
  quizzesGlobal?: Quiz[];
  status: ModuleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModuleData {
  title: string;
  description: string;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  thematics: string;
  imageMediaId?: string | null;
}
export interface UpdateModuleData {
  title?: string;
  description?: string;
  thematics?: string;
  imageMediaId?: string | null;
  difficultyLevel?: DifficultyLevel;
  estimatedDuration?: number;
  status?: ModuleStatus;
}
