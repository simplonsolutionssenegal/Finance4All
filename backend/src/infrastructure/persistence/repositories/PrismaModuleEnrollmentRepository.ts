import type { PrismaClient } from '@prisma/client';
import type { ModuleEnrollmentRepository } from '@/domain/formations/ports/out/ModuleEnrollmentRepository';
import type { ModuleEnrollmentDTO } from '@/domain/formations/value-objects/ModuleEnrollmentDTO';

export class PrismaModuleEnrollmentRepository implements ModuleEnrollmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createIfNotExists(input: {
    moduleId: string;
    userId: string;
  }): Promise<ModuleEnrollmentDTO> {
    const existing = await this.prisma.moduleEnrollment.findUnique({
      where: {
        moduleId_userId: {
          moduleId: input.moduleId,
          userId: input.userId,
        },
      },
    });

    if (existing) {
      return this.toDTO(existing);
    }

    const created = await this.prisma.moduleEnrollment.create({
      data: {
        moduleId: input.moduleId,
        userId: input.userId,
      },
    });

    return this.toDTO(created);
  }

  async findByUserId(userId: string): Promise<ModuleEnrollmentDTO[]> {
    const enrollments = await this.prisma.moduleEnrollment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return enrollments.map(enrollment => this.toDTO(enrollment));
  }

  private toDTO(enrollment: {
    id: string;
    moduleId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): ModuleEnrollmentDTO {
    return {
      id: enrollment.id,
      moduleId: enrollment.moduleId,
      userId: enrollment.userId,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    };
  }
}
