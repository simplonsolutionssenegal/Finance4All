import type { GetBeneficiaryStatsUseCase } from '@/domain/Beneficiary/ports/in/GetBeneficiaryStatsUseCase';
import type {
  BeneficiaryRepository,
  DemographicStats,
} from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';

export class GetBeneficiaryStatsUseCaseImpl implements GetBeneficiaryStatsUseCase {
  constructor(private readonly repo: BeneficiaryRepository) {}

  async execute(organizationId?: string): Promise<DemographicStats> {
    return this.repo.getDemographicStats(organizationId);
  }
}
