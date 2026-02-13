import type { Module } from '@/domain/formations/entities/ModuleFormation';
import type {
  GetModulesUseCase,
  GetModulesUseCaseQuery,
} from '@/domain/formations/ports/in/GetModulesUseCase';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import type { PaginatedResult } from '@/domain/shared/Pagination';

export class GetModulesFormationUseCaseImpl implements GetModulesUseCase {
  constructor(private readonly moduleRepository: ModuleRepository) {}
  async execute(query: GetModulesUseCaseQuery): Promise<PaginatedResult<ModuleResponseDTO>> {
    // Récupérer tous les modules
    const result = await this.moduleRepository.findAll({
      page: query.page,
      limit: query.limit,
    });
    return {
      data: result.data.map((module: Module) => module.toDTO()),
      pagination: result.pagination,
    };
  }
}
