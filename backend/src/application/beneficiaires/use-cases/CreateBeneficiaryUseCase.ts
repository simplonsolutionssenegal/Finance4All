import type {
  CreateBeneficiaryCommand,
  CreateBeneficiaryResult,
} from '@/domain/Beneficiary/entities/Beneficiary';

export interface CreateBeneficiaryUseCase {
  execute(cmd: CreateBeneficiaryCommand): Promise<CreateBeneficiaryResult>;
}
