import type { UseCase } from '@/domain/shared/UseCase';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';

export interface GetModuleByIdUseCaseQuery {
  id: string;
}

export interface GetModuleByIdUseCase
  extends UseCase<GetModuleByIdUseCaseQuery, ModuleResponseDTO> {}
