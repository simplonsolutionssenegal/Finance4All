import type { ModuleEnrollmentDTO } from '@/domain/formations/value-objects/ModuleEnrollmentDTO';

export interface ModuleEnrollmentRepository {
  createIfNotExists(input: { moduleId: string; userId: string }): Promise<ModuleEnrollmentDTO>;
  findByUserId(userId: string): Promise<ModuleEnrollmentDTO[]>;
}
