import type { UseCase } from '@/domain/shared/UseCase';
import type { ModuleEnrollmentDTO } from '@/domain/formations/value-objects/ModuleEnrollmentDTO';

export interface GetMyEnrollmentsQuery {
  userId: string;
}

export interface GetMyEnrollmentsUseCase
  extends UseCase<GetMyEnrollmentsQuery, ModuleEnrollmentDTO[]> {}
