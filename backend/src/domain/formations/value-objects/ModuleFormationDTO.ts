import type { DifficultyLevel, ModuleStatus } from '../entities/ModuleFormation';
import type { Thematic } from './Thematic';

export interface ModuleResponseDTO {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  thematics: Thematic[];
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  status: ModuleStatus;
  createdAt: Date;
  updatedAt: Date;
}
