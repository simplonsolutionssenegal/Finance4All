import type {
  AddServiceCommand,
  AddServiceUseCase,
} from '@/domain/institutions/ports/in/AddServiceUseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { Service } from '@/domain/institutions/entities/Service';
import type { Institution } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';

export class AddServiceUseCaseImpl implements AddServiceUseCase {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async execute(command: AddServiceCommand): Promise<InstitutionDTO> {
    const existingInstitution = await this.institutionRepository.findById(command.idInstitution);

    if (!existingInstitution) {
      throw new NotFoundError(`Institution with id ${command.idInstitution} not found`);
    }

    const service = new Service({
      id: EntityId.generate(),
      name: command.name,
      longName: command.longName,
      type: command.type,
      frais: command.frais,
      conditionAccess: command.conditionAccess,
      plafonds: command.plafonds,
      infrastructureAccess: command.infrastructureAccess,
    });

    existingInstitution.addService(service);

    const savedInstitution = await this.institutionRepository.save(existingInstitution);

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
      services: institution.services,
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt,
    };
  }
}
