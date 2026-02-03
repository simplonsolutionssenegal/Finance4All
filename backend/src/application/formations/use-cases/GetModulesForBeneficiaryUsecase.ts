import type { PrismaClient } from '@prisma/client';
import type { ModuleWithAssignmentDTO } from '@/domain/formations/value-objects/AssignmentDTO';

export class GetModulesForBeneficiaryUseCaseImpl {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly minioPublicUrl: string
  ) {}

  async execute(params: {
    beneficiaryId: string;
    organizationId: string;
  }): Promise<ModuleWithAssignmentDTO[]> {
    const [modules, assignments] = await Promise.all([
      this.prisma.module.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          imageMedia: true,
        },
      }),
      this.prisma.moduleAssignment.findMany({
        where: { beneficiaryId: params.beneficiaryId, removedAt: null },
        select: { moduleId: true, status: true, progress: true },
      }),
    ]);

    const map = new Map(assignments.map(a => [a.moduleId, a]));

    return modules.map(m => {
      const a = map.get(m.id);

      const imageUrl =
        m.imageMedia && m.imageMedia.bucket && m.imageMedia.path
          ? `${this.minioPublicUrl}/${m.imageMedia.bucket}/${m.imageMedia.path}`
          : null;

      return {
        id: m.id,
        title: m.title,
        thematics: m.thematics,
        difficultyLevel: m.difficultyLevel,
        estimatedDuration: m.estimatedDuration,
        status: m.status,

        imageUrl,

        assigned: !!a,
        assignmentStatus: a?.status ?? null,
        assignmentProgress: a?.progress ?? null,
      };
    });
  }
}
