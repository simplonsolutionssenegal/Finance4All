import type {
  GetInstitutionsUseCase,
  GetInstitutionsQuery,
} from '@/domain/institutions/ports/in/GetInstitutionsUseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import type { PaginatedResult } from '@/domain/shared/Pagination';
import type { Institution } from '@/domain/institutions/entities/Institution';

export class GetInstitutionsUseCaseImpl implements GetInstitutionsUseCase {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async execute(query: GetInstitutionsQuery): Promise<PaginatedResult<InstitutionDTO>> {
    const result = await this.institutionRepository.findAll({
      page: query.page,
      limit: query.limit,
    });

    return {
      data: result.data.map((institution: Institution) => institution.toDTO()),
      pagination: result.pagination,
    };
  }
}
