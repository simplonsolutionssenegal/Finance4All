import type { UseCase } from '@/application/shared/UseCase';
import type { CreateInstitutionDto } from '@/application/institutions/dto/CreateInstituionDto';
import type { InstitutionResponseDto } from '../dto/InstitutionResponseDto';
import type { InstitutionRepository } from '@/domain/institutions/repositories/InstitutionRepository';
import type { InstitutionDomainService } from '@/domain/institutions/services/InstitutionDomainService';
import { Institution, InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { DuplicateError } from '@/domain/shared/errors';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { InstitutionMapper } from '@/application/institutions/mappers/InstitutionMapper';

export class CreateInstitutionUseCase
  implements UseCase<CreateInstitutionDto, InstitutionResponseDto>
{
  constructor(
    private readonly institutionRepository: InstitutionRepository,
    private readonly institutionDomainService: InstitutionDomainService
  ) {}

  async execute(dto: CreateInstitutionDto): Promise<InstitutionResponseDto> {
    const name = dto.name;

    const isUnique = await this.institutionDomainService.isNameUnique(name);
    if (!isUnique) {
      throw new DuplicateError(dto.name, 'institution');
    }

    const institution = new Institution({
      id: EntityId.generate(),
      name,
      description: dto.description,
      website: UrlValueObject.from(dto.website || null),
      geographicZones: dto.geographicZones,
      logoUrl: UrlValueObject.from(dto.logoUrl || null),
      status: InstitutionStatus.PENDING,
    });

    const savedInstitution = await this.institutionRepository.save(institution);

    return InstitutionMapper.toDTO(savedInstitution);
  }
}
