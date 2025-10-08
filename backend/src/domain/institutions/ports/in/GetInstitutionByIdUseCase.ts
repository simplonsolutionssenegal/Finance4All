import type { UseCase } from '@/domain/shared/UseCase';
import type { InstitutionDTO } from './CreateInstitutionUseCase';

export interface GetInstitutionByIdQuery {
  id: string;
}

export interface GetInstitutionByIdUseCase
  extends UseCase<GetInstitutionByIdQuery, InstitutionDTO> {}
