import type { PrismaModuleAssignmentRepository } from '@/infrastructure/persistence/repositories/PrismaModuleAssignmentRepository';

export class RemoveModulesFromBeneficiaryUseCaseImpl {
  constructor(private readonly repo: PrismaModuleAssignmentRepository) {}

  async execute(params: { beneficiaryId: string; organizationId: string; moduleIds: string[] }) {
    const uniqueIds = Array.from(new Set(params.moduleIds)).filter(Boolean);

    if (uniqueIds.length === 0) return { removedCount: 0 };

    await this.repo.removeMany({
      beneficiaryId: params.beneficiaryId,
      moduleIds: uniqueIds,
    });

    return { removedCount: uniqueIds.length };
  }
}
