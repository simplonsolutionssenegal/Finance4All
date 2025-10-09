import type { UseCase } from '@/domain/shared/UseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type { InstitutionStatus } from '@/domain/institutions/entities/Institution';

export interface UpdateInstitutionStatusCommand {
  id: string;
  status: InstitutionStatus;
}

export interface UpdateInstitutionStatusUseCase
  extends UseCase<UpdateInstitutionStatusCommand, InstitutionDTO> {}
