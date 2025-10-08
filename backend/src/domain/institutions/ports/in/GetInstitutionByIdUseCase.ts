import type { UseCase } from '@/domain/shared/UseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';

export interface GetInstitutionByIdQuery {
  id: string;
}

export interface GetInstitutionByIdUseCase
  extends UseCase<GetInstitutionByIdQuery, InstitutionDTO> {}
