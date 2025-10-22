import type {
  GetInstitutionsByServiceTypeUseCase,
  GetInstitutionsByServiceTypeQuery,
} from '@/domain/institutions/ports/in/GetInstitutionsByServiceTypeUseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import type { PaginatedResult } from '@/domain/shared/Pagination';
import type { Institution } from '@/domain/institutions/entities/Institution';
import { TypeService } from '@/domain/institutions/entities/Service';

export class GetInstitutionsByServiceTypeUseCaseImpl
  implements GetInstitutionsByServiceTypeUseCase
{
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async execute(
    query: GetInstitutionsByServiceTypeQuery
  ): Promise<PaginatedResult<InstitutionDTO>> {
    const result = await this.institutionRepository.findByServiceType(query.type, {
      page: query.page,
      limit: query.limit,
    });

    return {
      data: result.data.map((institution: Institution) => {
        const dto = institution.toDTO();
        dto.services = dto.services.filter(
          service => service.type === TypeService[query.type as keyof typeof TypeService]
        );
        return dto;
      }),
      pagination: result.pagination,
    };
  }
}
