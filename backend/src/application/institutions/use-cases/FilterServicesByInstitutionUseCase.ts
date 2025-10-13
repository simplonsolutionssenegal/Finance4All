// src/application/institutions/use-case/FilterServicesByInstitutionUseCase.ts
import type {
  FilterServicesByInstitutionUseCase,
  FilterServicesByInstitutionQuery,
} from '@/domain/institutions/ports/in/FilterServicesByInstitutionUseCase';
import type { PaginatedResult } from '@/domain/shared/Pagination';
import type { ServiceDTO } from '@/domain/institutions/value-objects/ServiceDTO';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';

export class FilterServicesByInstitutionUseCaseImpl implements FilterServicesByInstitutionUseCase {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async execute(q: FilterServicesByInstitutionQuery): Promise<PaginatedResult<ServiceDTO>> {
    const result = await this.institutionRepository.findByFilters({
      institutionId: q.institutionId,
      page: q.page,
      limit: q.limit,
      types: q.types,
      fromDate: q.fromDate,
    });

    return {
      data: result.data.map(service => service.toDTO()),
      pagination: result.pagination,
    };
  }
}
