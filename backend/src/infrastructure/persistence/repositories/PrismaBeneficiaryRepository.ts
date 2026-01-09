import type { BeneficiaryRepository } from '@/domain/Beneficiary/repositories/BeneficiaryRepository';
import { Beneficiary, BeneficiaryStatus } from '@/domain/Beneficiary/entities/Beneficiary';
import type { PrismaClient } from '@prisma/client';

function toDomainStatus(prismaStatus: string): BeneficiaryStatus {
  return prismaStatus === 'ACTIVE' ? BeneficiaryStatus.ACTIVE : BeneficiaryStatus.INACTIVE;
}

export class PrismaBeneficiaryRepository implements BeneficiaryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByOrgId(organizationId: string) {
    const rows = await this.prisma.beneficiary.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map(
      r =>
        new Beneficiary(
          r.id,
          r.organizationId,
          r.clerkUserId,
          r.firstName,
          r.lastName,
          r.email,
          r.phone,
          toDomainStatus(r.status),
          r.progressPercent,
          r.createdAt,
          r.updatedAt
        )
    );
  }

  async findByOrgAndEmail(organizationId: string, email: string) {
    const r = await this.prisma.beneficiary.findFirst({ where: { organizationId, email } });
    if (!r) return null;
    return new Beneficiary(
      r.id,
      r.organizationId,
      r.clerkUserId,
      r.firstName,
      r.lastName,
      r.email,
      r.phone,
      toDomainStatus(r.status),
      r.progressPercent,
      r.createdAt,
      r.updatedAt
    );
  }

  async findByIdInOrg(organizationId: string, beneficiaryId: string) {
    const r = await this.prisma.beneficiary.findFirst({
      where: { id: beneficiaryId, organizationId },
    });
    if (!r) return null;

    return new Beneficiary(
      r.id,
      r.organizationId,
      r.clerkUserId,
      r.firstName,
      r.lastName,
      r.email,
      r.phone,
      toDomainStatus(r.status),
      r.progressPercent,
      r.createdAt,
      r.updatedAt
    );
  }

  async create(input: {
    organizationId: string;
    clerkUserId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  }) {
    const r = await this.prisma.beneficiary.create({
      data: {
        organizationId: input.organizationId,
        clerkUserId: input.clerkUserId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone ?? null,
      },
    });

    return new Beneficiary(
      r.id,
      r.organizationId,
      r.clerkUserId,
      r.firstName,
      r.lastName,
      r.email,
      r.phone,
      toDomainStatus(r.status),
      r.progressPercent,
      r.createdAt,
      r.updatedAt
    );
  }

  async updateInOrg(input: {
    organizationId: string;
    beneficiaryId: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    status?: 'ACTIVE' | 'INACTIVE';
  }) {
    const exists = await this.prisma.beneficiary.findFirst({
      where: { id: input.beneficiaryId, organizationId: input.organizationId },
    });
    if (!exists) throw new Error('Accès refusé (organisation) ou bénéficiaire introuvable.');

    const r = await this.prisma.beneficiary.update({
      where: { id: input.beneficiaryId },
      data: {
        ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });

    return new Beneficiary(
      r.id,
      r.organizationId,
      r.clerkUserId,
      r.firstName,
      r.lastName,
      r.email,
      r.phone,
      toDomainStatus(r.status),
      r.progressPercent,
      r.createdAt,
      r.updatedAt
    );
  }

  async deleteByIdAndOrgId(beneficiaryId: string, organizationId: string): Promise<boolean> {
    const result = await this.prisma.beneficiary.deleteMany({
      where: { id: beneficiaryId, organizationId },
    });
    return result.count > 0;
  }
}
