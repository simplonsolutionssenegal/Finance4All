import type { DifficultyLevel, ModuleStatus } from '../entities/ModuleFormation';

export interface ModuleResponseDTO {
  id: string;
  title: string;
  description: string;
  imageMediaId: string | null;
  thematics: string;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  status: ModuleStatus;
  createdAt: Date;
  updatedAt: Date;
}
