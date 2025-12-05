import type { Beneficiary, UpdateBeneficiaryCommand } from '../../entities/Beneficiary';

export interface UpdateBeneficiaryUseCase {
  execute(cmd: UpdateBeneficiaryCommand): Promise<Beneficiary>;
}
