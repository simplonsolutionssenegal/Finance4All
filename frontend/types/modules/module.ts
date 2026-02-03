// frontend/src/types/formations/module.ts

import { Lesson } from './Lesson';
import { Quiz } from './Quiz';

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
