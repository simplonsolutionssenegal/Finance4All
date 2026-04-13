import type { SelfRegisterBeneficiaryCommand, Beneficiary } from '../../entities/Beneficiary';

export interface SelfRegisterBeneficiaryUseCase {
  execute(cmd: SelfRegisterBeneficiaryCommand): Promise<Beneficiary>;
}
