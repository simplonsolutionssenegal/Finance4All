import crypto from 'crypto';
import type { CreateBeneficiaryUseCase } from './CreateBeneficiaryUseCase';
import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
import type { OrganizationIdentityPort } from '@/domain/Beneficiary/ports/out/OrganizationIdentityPort';
import type {
  CreateBeneficiaryCommand,
  CreateBeneficiaryResult,
} from '@/domain/Beneficiary/entities/Beneficiary';

function genTempPassword() {
  return crypto.randomBytes(8).toString('base64url');
}

export class CreateBeneficiaryUseCaseImpl implements CreateBeneficiaryUseCase {
  constructor(
    private readonly beneficiaryRepo: BeneficiaryRepository,
    private readonly orgIdentity: OrganizationIdentityPort
  ) {}

  async execute(cmd: CreateBeneficiaryCommand): Promise<CreateBeneficiaryResult> {
    const exists = await this.beneficiaryRepo.findByOrgAndEmail(cmd.organizationId, cmd.email);
    if (exists) throw new Error('Bénéficiaire déjà existant dans cette organisation.');

    const tempPassword = cmd.generateTempPassword ? genTempPassword() : undefined;

    const { clerkUserId } = await this.orgIdentity.upsertUser({
      email: cmd.email,
      firstName: cmd.firstName,
      lastName: cmd.lastName,
      tempPassword,
    });

    await this.orgIdentity.ensureMembership({
      organizationId: cmd.organizationId,
      clerkUserId,
      role: 'org:recipient',
    });

    const beneficiary = await this.beneficiaryRepo.create({
      organizationId: cmd.organizationId,
      clerkUserId,
      firstName: cmd.firstName,
      lastName: cmd.lastName,
      email: cmd.email,
      phone: cmd.phone ?? null,
      birthDate: cmd.birthDate ? new Date(cmd.birthDate) : null,
      gender: cmd.gender ?? null,
    });

    return { beneficiary, tempPassword };
  }
}
