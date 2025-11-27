//domain/formations/ports/in/CreateModuleUseCase.ts

import type { UseCase } from '@/domain/shared/UseCase';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import type { Thematic } from '@/domain/formations/value-objects/Thematic';
import type { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';

export interface CreateModuleUseCommand {
  title: string;
  description: string;
  imageUrl: string | null;
  thematics: Thematic[];
  difficultyLevel: DifficultyLevel;
  estimatedDuration: number;
  status: ModuleStatus;
}
export interface CreateModuleUseCase extends UseCase<CreateModuleUseCommand, ModuleResponseDTO> {}
