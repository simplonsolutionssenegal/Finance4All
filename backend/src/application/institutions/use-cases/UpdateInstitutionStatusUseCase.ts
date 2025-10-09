import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';

import { InstitutionStatus, type Institution } from '@/domain/institutions/entities/Institution';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type {
  UpdateInstitutionStatusCommand,
  UpdateInstitutionStatusUseCase,
} from '@/domain/institutions/ports/in/UpdateInstitutionStatusUseCase';

export class UpdateInstitutionStatusUseCaseImpl implements UpdateInstitutionStatusUseCase {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async execute(command: UpdateInstitutionStatusCommand): Promise<InstitutionDTO> {
    const existingInstitution = await this.institutionRepository.findById(command.id);

    if (!existingInstitution) {
      throw new NotFoundError(`Institution with id ${command.id} not found`);
    }

    if (command.status === InstitutionStatus.ACTIVE) {
      existingInstitution.activate();
    }

    if (command.status === InstitutionStatus.INACTIVE) {
      existingInstitution.deactivate();
    }

    const savedInstitution = await this.institutionRepository.update(existingInstitution);

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
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt,
    };
  }
}
