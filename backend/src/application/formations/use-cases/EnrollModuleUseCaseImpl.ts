import type {
  EnrollModuleUseCase,
  EnrollModuleCommand,
} from '@/domain/formations/ports/in/EnrollModuleUseCase';
import type { ModuleEnrollmentDTO } from '@/domain/formations/value-objects/ModuleEnrollmentDTO';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { ModuleEnrollmentRepository } from '@/domain/formations/ports/out/ModuleEnrollmentRepository';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

export class EnrollModuleUseCaseImpl implements EnrollModuleUseCase {
  constructor(
    private readonly moduleRepository: ModuleRepository,
    private readonly enrollmentRepository: ModuleEnrollmentRepository
  ) {}

  async execute(command: EnrollModuleCommand): Promise<ModuleEnrollmentDTO> {
    const module = await this.moduleRepository.findById(command.moduleId);
    if (!module) {
      throw new NotFoundError(`module with id ${command.moduleId} not found`);
    }

    return this.enrollmentRepository.createIfNotExists({
      moduleId: command.moduleId,
      userId: command.userId,
    });
  }
}
