import type { UseCase } from '@/domain/shared/UseCase';
import type { ModuleEnrollmentDTO } from '@/domain/formations/value-objects/ModuleEnrollmentDTO';

export interface EnrollModuleCommand {
  moduleId: string;
  userId: string;
}

export interface EnrollModuleUseCase extends UseCase<EnrollModuleCommand, ModuleEnrollmentDTO> {}
