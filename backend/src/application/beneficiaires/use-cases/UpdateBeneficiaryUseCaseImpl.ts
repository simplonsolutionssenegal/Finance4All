import type { UpdateBeneficiaryCommand } from '@/domain/Beneficiary/entities/Beneficiary';
import type { UpdateBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/UpdateBeneficiaryUseCase';
import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';

export class UpdateBeneficiaryUseCaseImpl implements UpdateBeneficiaryUseCase {
  constructor(private readonly repo: BeneficiaryRepository) {}

  async execute(cmd: UpdateBeneficiaryCommand) {
    const current = await this.repo.findByIdInOrg(cmd.organizationId, cmd.beneficiaryId);
    if (!current) throw new Error('Bénéficiaire introuvable.');
    return this.repo.updateInOrg({
      organizationId: cmd.organizationId,
      beneficiaryId: cmd.beneficiaryId,
      firstName: cmd.firstName,
      lastName: cmd.lastName,
      phone: cmd.phone,
      birthDate: cmd.birthDate
        ? new Date(cmd.birthDate)
        : cmd.birthDate === null
          ? null
          : undefined,
      gender: cmd.gender,
      status: cmd.status,
    });
  }
}
