//domain/formations/ports/in/GetModulesUseCase.ts
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';
import type { UseCase } from '@/domain/shared/UseCase';

export interface GetModulesUseCaseQuery extends PaginationParams {}
export interface GetModulesUseCase
  extends UseCase<GetModulesUseCaseQuery, PaginatedResult<ModuleResponseDTO>> {}
