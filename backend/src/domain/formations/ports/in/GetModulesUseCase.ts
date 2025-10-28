//domain/formations/ports/in/GetModulesUseCase.ts

import type { UseCase } from '@/domain/shared/UseCase';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';

export interface GetModulesUseCase extends UseCase<void, ModuleResponseDTO[]> {
  execute(): Promise<ModuleResponseDTO[]>;
}
