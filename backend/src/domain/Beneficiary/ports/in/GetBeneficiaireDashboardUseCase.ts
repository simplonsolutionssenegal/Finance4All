import type { UseCase } from '@/domain/shared/UseCase';
import type { BeneficiaireDashboardDTO } from '../../value-objects/BeneficiaireDashboardDTO';

export interface GetBeneficiaireDashboardQuery {
  clerkUserId: string;
}

export interface GetBeneficiaireDashboardUseCase
  extends UseCase<GetBeneficiaireDashboardQuery, BeneficiaireDashboardDTO> {}
