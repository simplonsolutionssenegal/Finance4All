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

export enum Thematic {
  FINANCIAL_EDUCATION = 'FINANCIAL_EDUCATION',
  PERSONAL_DEVELOPMENT = 'PERSONAL_DEVELOPMENT',
  FINANCIAL_LOAN = 'FINANCIAL_LOAN',
  BANK_CREDIT = 'BANK_CREDIT',
  INVESTMENT = 'INVESTMENT',
  BUDGET_MANAGEMENT = 'BUDGET_MANAGEMENT',
  SAVING = 'SAVING',
  ENTREPRENEURSHIP = 'ENTREPRENEURSHIP',
  TAXATION = 'TAXATION',
  INSURANCE = 'INSURANCE',
}

export interface Module {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  thematics: Thematic[];
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
  thematics: Thematic[];
}
