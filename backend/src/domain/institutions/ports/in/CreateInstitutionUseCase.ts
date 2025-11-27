import type { UseCase } from '@/domain/shared/UseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type { InstitutionTypeEnum } from '@/domain/institutions/value-objects/InstitutionType';
import type { CountryType } from '@/domain/institutions/value-objects/Country';

export interface CreateInstitutionCommand {
  name: string;
  description: string;
  website?: string;
  geographicZones: string[];
  logoUrl?: string;
  type: InstitutionTypeEnum;
  pays: CountryType;
}

export interface CreateInstitutionUseCase
  extends UseCase<CreateInstitutionCommand, InstitutionDTO> {}
