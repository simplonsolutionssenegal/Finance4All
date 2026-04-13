import type { SelfRegisterBeneficiaryUseCase } from '@/domain/Beneficiary/ports/in/SelfRegisterBeneficiaryUseCase';
import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
import type {
  SelfRegisterBeneficiaryCommand,
  Beneficiary,
} from '@/domain/Beneficiary/entities/Beneficiary';

export class SelfRegisterBeneficiaryUseCaseImpl implements SelfRegisterBeneficiaryUseCase {
  constructor(private readonly repo: BeneficiaryRepository) {}

  async execute(cmd: SelfRegisterBeneficiaryCommand): Promise<Beneficiary> {
    const existing = await this.repo.findByClerkUserId(cmd.clerkUserId);
    if (existing) return existing;

    const existingByEmail = await this.repo.findByEmail(cmd.email);
    if (existingByEmail) return existingByEmail;

    return this.repo.create({
      organizationId: null,
      clerkUserId: cmd.clerkUserId,
      firstName: cmd.firstName,
      lastName: cmd.lastName,
      email: cmd.email,
      phone: cmd.phone ?? null,
      birthDate: cmd.birthDate ? new Date(cmd.birthDate) : null,
      gender: cmd.gender ?? null,
    });
  }
}
