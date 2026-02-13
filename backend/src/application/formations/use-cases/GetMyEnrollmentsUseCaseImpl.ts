import type {
  GetMyEnrollmentsUseCase,
  GetMyEnrollmentsQuery,
} from '@/domain/formations/ports/in/GetMyEnrollmentsUseCase';
import type { ModuleEnrollmentDTO } from '@/domain/formations/value-objects/ModuleEnrollmentDTO';
import type { ModuleEnrollmentRepository } from '@/domain/formations/ports/out/ModuleEnrollmentRepository';

export class GetMyEnrollmentsUseCaseImpl implements GetMyEnrollmentsUseCase {
  constructor(private readonly enrollmentRepository: ModuleEnrollmentRepository) {}

  async execute(query: GetMyEnrollmentsQuery): Promise<ModuleEnrollmentDTO[]> {
    return this.enrollmentRepository.findByUserId(query.userId);
  }
}
