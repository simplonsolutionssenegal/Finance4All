import type { PrismaClient } from '@prisma/client';

export class PrismaModuleAssignmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createMany(params: { beneficiaryId: string; moduleIds: string[] }) {
    const { beneficiaryId, moduleIds } = params;

    if (!moduleIds.length) return { assignedCount: 0 };
    await this.prisma.$transaction(
      moduleIds.map(moduleId =>
        this.prisma.moduleAssignment.upsert({
          where: {
            beneficiaryId_moduleId: { beneficiaryId, moduleId },
          },
          create: {
            beneficiaryId,
            moduleId,
            assignedAt: new Date(),
            removedAt: null,
            progress: 0,
            status: 'ASSIGNED',
          },
          update: {
            removedAt: null,
            // optionnel: reset progress/status
            status: 'ASSIGNED',
          },
        })
      )
    );

    return { assignedCount: moduleIds.length };
  }

  async listByBeneficiary(beneficiaryId: string) {
    return this.prisma.moduleAssignment.findMany({
      where: { beneficiaryId, removedAt: null },
      select: {
        moduleId: true,
        status: true,
        progress: true,
      },
    });
  }

  async removeMany(params: { beneficiaryId: string; moduleIds: string[] }) {
    const { beneficiaryId, moduleIds } = params;
    await this.prisma.moduleAssignment.updateMany({
      where: { beneficiaryId, moduleId: { in: moduleIds }, removedAt: null },
      data: { status: 'REMOVED', removedAt: new Date() },
    });
  }
}
