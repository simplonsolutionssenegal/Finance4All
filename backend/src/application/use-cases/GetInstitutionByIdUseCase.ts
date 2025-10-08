import type {
  GetInstitutionByIdUseCase,
  GetInstitutionByIdQuery,
} from '@/domain/institutions/ports/in/GetInstitutionByIdUseCase';
import type { InstitutionDTO } from '@/domain/institutions/ports/in/CreateInstitutionUseCase';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import type { Institution } from '@/domain/institutions/entities/Institution';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

export class GetInstitutionByIdUseCaseImpl implements GetInstitutionByIdUseCase {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async execute(query: GetInstitutionByIdQuery): Promise<InstitutionDTO> {
    const institution = await this.institutionRepository.findById(query.id);

    if (!institution) {
      throw new NotFoundError(`Institution with id ${query.id} not found`);
    }

    return this.toDTO(institution);
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
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt,
    };
  }
}
