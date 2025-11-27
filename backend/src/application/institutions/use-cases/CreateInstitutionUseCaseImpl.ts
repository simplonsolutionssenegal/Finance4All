import type { InstitutionDomainService } from '@/domain/institutions/services/InstitutionDomainService';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { DuplicateError } from '@/domain/shared/errors';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import type {
  CreateInstitutionCommand,
  CreateInstitutionUseCase,
} from '@/domain/institutions/ports/in/CreateInstitutionUseCase';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';

export class CreateInstitutionUseCaseImpl implements CreateInstitutionUseCase {
  constructor(
    private readonly institutionRepository: InstitutionRepository,
    private readonly institutionDomainService: InstitutionDomainService
  ) {}

  async execute(dto: CreateInstitutionCommand): Promise<InstitutionDTO> {
    const name = dto.name;

    const isUnique = await this.institutionDomainService.isNameUnique(name);
    if (!isUnique) {
      throw new DuplicateError(dto.name, 'institution');
    }

    const institution = new Institution({
      id: EntityId.generate(),
      name,
      type: dto.type,
      description: dto.description,
      website: UrlValueObject.from(dto.website || null),
      geographicZones: dto.geographicZones,
      logoUrl: UrlValueObject.from(dto.logoUrl || null),
      pays: dto.pays,
      status: InstitutionStatus.PENDING,
      services: [],
    });

    const savedInstitution = await this.institutionRepository.save(institution);

    return savedInstitution.toDTO();
  }
}
