import type {
  UpdateInstitutionCommand,
  UpdateInstitutionUseCase,
} from '@/domain/institutions/ports/in/UpdateInstitutionUseCase';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';

import { Institution } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';

export class UpdateInstitutionUseCaseImpl implements UpdateInstitutionUseCase {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async execute(command: UpdateInstitutionCommand): Promise<InstitutionDTO> {
    const existingInstitution = await this.institutionRepository.findById(command.id);

    if (!existingInstitution) {
      throw new NotFoundError(`Institution with id ${command.id} not found`);
    }

    const updatedInstitution = new Institution({
      id: EntityId.from(command.id),
      name: command.name,
      description: command.description,
      website: UrlValueObject.from(command.website || null),
      geographicZones: command.geographicZones,
      logoUrl: UrlValueObject.from(command.logoUrl || null),
      status: existingInstitution.status,
      services: existingInstitution.services,
    });

    const savedInstitution = await this.institutionRepository.update(updatedInstitution);

    return this.toDTO(savedInstitution);
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
