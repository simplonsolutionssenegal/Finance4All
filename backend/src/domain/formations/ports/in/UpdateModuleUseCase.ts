// domain/formations/ports/in/UpdateModuleUseCase.ts
import type { UseCase } from '@/domain/shared/UseCase';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import type { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';

export interface UpdateModuleUseCommand {
  id: string;
  title?: string;
  description?: string;
  thematics?: string;
  imageMediaId?: string | null;
  difficultyLevel?: DifficultyLevel;
  estimatedDuration?: number;
  status?: ModuleStatus;
}

export interface UpdateModuleUseCase extends UseCase<UpdateModuleUseCommand, ModuleResponseDTO> {}
