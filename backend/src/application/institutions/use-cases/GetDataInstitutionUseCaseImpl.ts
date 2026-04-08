import type {
  GetDataInstitutionQuery,
  GetDataInstitutionUseCase,
} from '@/domain/institutions/ports/in/GetDataInstitutionUseCase';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import type { InstitutionStatsDTO } from '@/domain/institutions/value-objects/InstitutionStatsDTO';

export class GetDataInstitutionUseCaseImpl implements GetDataInstitutionUseCase {
  constructor(private readonly institutionRepository: InstitutionRepository) {}

  async execute(_query: GetDataInstitutionQuery): Promise<InstitutionStatsDTO> {
    return this.institutionRepository.getStats();
  }
}
