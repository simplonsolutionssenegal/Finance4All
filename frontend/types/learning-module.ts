import { DifficultyLevel, ModuleStatus } from './modules/module';

export enum UserModuleStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  status: ModuleStatus;
  imageMediaId?: string | null;
  lessonCount: number;
  // Mocked fields for learning view
  userStatus: UserModuleStatus;
  progressPercent: number;
  thematic?: string;
}
