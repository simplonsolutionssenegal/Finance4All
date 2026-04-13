import type {
  BeneficiaryRepository,
  DemographicStats,
} from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
import { Beneficiary, BeneficiaryStatus } from '@/domain/Beneficiary/entities/Beneficiary';
import type { PrismaClient } from '@prisma/client';

function toDomainStatus(prismaStatus: string): BeneficiaryStatus {
  return prismaStatus === 'ACTIVE' ? BeneficiaryStatus.ACTIVE : BeneficiaryStatus.INACTIVE;
}

function toDomain(r: {
  id: string;
  organizationId: string | null;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthDate: Date | null;
  gender: string | null;
  status: string;
  progressPercent: number;
  createdAt: Date;
  updatedAt: Date;
}): Beneficiary {
  return new Beneficiary(
    r.id,
    r.organizationId,
    r.clerkUserId,
    r.firstName,
    r.lastName,
    r.email,
    r.phone,
    r.birthDate,
    (r.gender as 'HOMME' | 'FEMME') ?? null,
    toDomainStatus(r.status),
    r.progressPercent,
    r.createdAt,
    r.updatedAt
  );
}

export class PrismaBeneficiaryRepository implements BeneficiaryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getDemographicStats(organizationId?: string): Promise<DemographicStats> {
    const where = organizationId ? { organizationId } : {};
    const thirtyYearsAgo = new Date();
    thirtyYearsAgo.setFullYear(thirtyYearsAgo.getFullYear() - 30);

    const [total, women, youth, inTraining] = await Promise.all([
      this.prisma.beneficiary.count({ where }),
      this.prisma.beneficiary.count({ where: { ...where, gender: 'FEMME' } }),
      this.prisma.beneficiary.count({
        where: { ...where, birthDate: { gte: thirtyYearsAgo } },
      }),
      this.prisma.beneficiary.count({ where: { ...where, status: 'ACTIVE' } }),
    ]);

    return { total, women, youth, inTraining };
  }

  async findByClerkUserId(clerkUserId: string): Promise<Beneficiary | null> {
    const r = await this.prisma.beneficiary.findUnique({
      where: { clerkUserId },
    });
    if (!r) return null;
    return toDomain(r);
  }

  async findByOrgId(organizationId: string) {
    const rows = await this.prisma.beneficiary.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map(toDomain);
  }

  async findByOrgAndEmail(organizationId: string, email: string) {
    const r = await this.prisma.beneficiary.findFirst({ where: { organizationId, email } });
    if (!r) return null;
    return toDomain(r);
  }

  async findByIdInOrg(organizationId: string, beneficiaryId: string) {
    const r = await this.prisma.beneficiary.findFirst({
      where: { id: beneficiaryId, organizationId },
    });
    if (!r) return null;
    return toDomain(r);
  }

  async findByEmail(email: string): Promise<Beneficiary | null> {
    const r = await this.prisma.beneficiary.findUnique({ where: { email } });
    if (!r) return null;
    return toDomain(r);
  }

  async create(input: {
    organizationId?: string | null;
    clerkUserId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    birthDate?: Date | null;
    gender?: 'HOMME' | 'FEMME' | null;
  }) {
    const r = await this.prisma.beneficiary.create({
      data: {
        organizationId: input.organizationId ?? null,
        clerkUserId: input.clerkUserId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone ?? null,
        birthDate: input.birthDate ?? null,
        gender: input.gender ?? null,
      },
    });

    return toDomain(r);
  }

  async updateInOrg(input: {
    organizationId: string;
    beneficiaryId: string;
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    birthDate?: Date | null;
    gender?: 'HOMME' | 'FEMME' | null;
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
        ...(input.birthDate !== undefined ? { birthDate: input.birthDate } : {}),
        ...(input.gender !== undefined ? { gender: input.gender } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });

    return toDomain(r);
  }

  async deleteByIdAndOrgId(beneficiaryId: string, organizationId: string): Promise<boolean> {
    const result = await this.prisma.beneficiary.deleteMany({
      where: { id: beneficiaryId, organizationId },
    });
    return result.count > 0;
  }
}
