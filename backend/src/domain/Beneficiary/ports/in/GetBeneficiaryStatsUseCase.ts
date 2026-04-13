import type { DemographicStats } from '../out/BeneficiaryRepository';

export interface GetBeneficiaryStatsUseCase {
  execute(organizationId?: string): Promise<DemographicStats>;
}
