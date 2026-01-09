import type { CreateBeneficiaryCommand, CreateBeneficiaryResult } from '../../entities/Beneficiary';

export interface CreateBeneficiaryUseCase {
  execute(cmd: CreateBeneficiaryCommand): Promise<CreateBeneficiaryResult>;
}
