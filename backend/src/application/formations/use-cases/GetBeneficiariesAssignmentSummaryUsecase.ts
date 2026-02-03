import type { PrismaClient } from '@prisma/client';
import type { BeneficiaryAssignmentSummaryDTO } from '@/domain/formations/value-objects/AssignmentDTO';

export class GetBeneficiariesAssignmentSummaryUseCaseImpl {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(params: { organizationId: string }): Promise<BeneficiaryAssignmentSummaryDTO[]> {
    const beneficiaries = await this.prisma.beneficiary.findMany({
      where: { organizationId: params.organizationId },
      orderBy: { createdAt: 'desc' },
      include: {
        moduleAssignments: {
          where: { removedAt: null },
        },
      },
    });

    return beneficiaries.map(b => {
      const total = b.moduleAssignments.length;
      const completed = b.moduleAssignments.filter(a => a.status === 'COMPLETED').length;
      const inProgress = b.moduleAssignments.filter(a => a.status === 'IN_PROGRESS').length;
      const avgProgress =
        total === 0
          ? 0
          : Math.round(b.moduleAssignments.reduce((s, a) => s + (a.progress ?? 0), 0) / total);

      return {
        id: b.id,
        clerkUserId: b.clerkUserId,
        firstName: b.firstName,
        lastName: b.lastName,
        email: b.email,
        assignmentsCount: total,
        completedCount: completed,
        inProgressCount: inProgress,
        avgProgressPercent: avgProgress,
      };
    });
  }
}
