//domain/formations/value-objects/ModuleDTO.ts

import type { DifficultyLevel, ModuleStatus } from '../entities/ModuleFormation';
import type { Thematic } from './Thematic';

export interface CreateModuleDTO {
  title: string;
  description: string;
  thematics: Thematic[];
  imageUrl: string | null;
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
}

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
