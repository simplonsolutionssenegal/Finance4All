import type {
  AddServiceCommand,
  AddServiceUseCase,
} from '@/domain/institutions/ports/in/AddServiceUseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { Service } from '@/domain/institutions/entities/Service';
import { EntityId } from '@/domain/shared/EntityId';
import { FraisFactory } from '@/domain/institutions/factories/FraisFactory';

export class AddServiceUseCaseImpl implements AddServiceUseCase {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async execute(command: AddServiceCommand): Promise<InstitutionDTO> {
    const existingInstitution = await this.institutionRepository.findById(command.idInstitution);

    if (!existingInstitution) {
      throw new NotFoundError(`Institution with id ${command.idInstitution} not found`);
    }

    // const frais = this.mapFraisFromDTO(command.frais);
    const frais = FraisFactory.createFromDTO(command.frais);

    const service = new Service({
      id: EntityId.generate(),
      name: command.name,
      longName: command.longName,
      type: command.type,
      montantMin: command.montantMin,
      montantMax: command.montantMax,
      frais,
      conditionAccess: command.conditionAccess,
      plafonds: command.plafonds,
      infrastructureAccess: command.infrastructureAccess,
    });

    existingInstitution.addService(service);

    const savedInstitution = await this.institutionRepository.update(existingInstitution);

    return savedInstitution.toDTO();
  }
}
