import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import { FraisFactory } from '@/domain/institutions/factories/FraisFactory';
import type {
  UpdateServiceCommand,
  UpdateServiceUseCase,
} from '@/domain/institutions/ports/in/UpdateServiceUseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';

export class UpdateServiceUseCaseImpl implements UpdateServiceUseCase {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async execute(command: UpdateServiceCommand): Promise<InstitutionDTO> {
    const institution = await this.institutionRepository.findById(command.idInstitution);

    if (!institution) {
      throw new NotFoundError(`Institution with id ${command.idInstitution} not found`);
    }

    const service = institution.getServiceById(command.idService);
    if (!service) {
      throw new NotFoundError(`Service with id ${command.idService} not found`);
    }

    const frais = FraisFactory.createFromDTO(command.frais);

    service.updateName(command.name);
    service.updateLongName(command.longName);
    service.updateType(command.type);
    service.updateMontants(command.montantMin, command.montantMax);
    service.updateFrais(frais);
    service.updateConditionAccess(command.conditionAccess);
    service.updatePlafonds(command.plafonds);
    service.updateInfrastructureAccess(command.infrastructureAccess);

    const saved = await this.institutionRepository.update(institution);
    return saved.toDTO();
  }
}
