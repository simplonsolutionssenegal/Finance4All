import type { PrismaModuleAssignmentRepository } from '@/infrastructure/persistence/repositories/PrismaModuleAssignmentRepository';

export class AssignModulesToBeneficiaryUseCaseImpl {
  constructor(private readonly repo: PrismaModuleAssignmentRepository) {}

  async execute(params: { beneficiaryId: string; organizationId: string; moduleIds: string[] }) {
    const uniqueIds = Array.from(new Set(params.moduleIds)).filter(Boolean);
    await this.repo.createMany({ beneficiaryId: params.beneficiaryId, moduleIds: uniqueIds });
    return { assignedCount: uniqueIds.length };
  }
}
