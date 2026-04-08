import type { UseCase } from '@/domain/shared/UseCase';
import type { InstitutionStatsDTO } from '@/domain/institutions/value-objects/InstitutionStatsDTO';

export interface GetDataInstitutionQuery {}

export interface GetDataInstitutionUseCase
  extends UseCase<GetDataInstitutionQuery, InstitutionStatsDTO> {}
