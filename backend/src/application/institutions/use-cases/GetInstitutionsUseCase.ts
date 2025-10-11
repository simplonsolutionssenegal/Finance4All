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
      data: result.data.map((institution: Institution) => this.toDTO(institution)),
      pagination: result.pagination,
    };
  }

  private toDTO(institution: Institution): InstitutionDTO {
    return {
      id: institution.id.getValue(),
      name: institution.name,
      description: institution.description,
      website: institution.website.getValue(),
      geographicZones: institution.geographicZones,
      logoUrl: institution.logoUrl.getValue(),
      status: institution.status,
      services: institution.services.map(service => service.toDTO()),
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt,
    };
  }
}
