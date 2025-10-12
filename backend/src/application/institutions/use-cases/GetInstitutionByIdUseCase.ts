import type {
  GetInstitutionByIdUseCase,
  GetInstitutionByIdQuery,
} from '@/domain/institutions/ports/in/GetInstitutionByIdUseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

export class GetInstitutionByIdUseCaseImpl implements GetInstitutionByIdUseCase {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async execute(query: GetInstitutionByIdQuery): Promise<InstitutionDTO> {
    const institution = await this.institutionRepository.findById(query.id);

    if (!institution) {
      throw new NotFoundError(`Institution with id ${query.id} not found`);
    }

    return institution.toDTO();
  }
}
