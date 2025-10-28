//domain/formations/ports/in/CreateModuleUseCase.ts

import type { UseCase } from '@/domain/shared/UseCase';
import type {
  CreateModuleDTO,
  ModuleResponseDTO,
} from '@/domain/formations/value-objects/ModuleFormationDTO';

export interface CreateModuleUseCase extends UseCase<CreateModuleDTO, ModuleResponseDTO> {
  execute(input: CreateModuleDTO): Promise<ModuleResponseDTO>;
}
