import type { UseCase } from '@/domain/shared/UseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type { InstitutionTypeEnum } from '../../value-objects/InstitutionType';
import type { CountryType } from '../../value-objects/Country';

export interface UpdateInstitutionCommand {
  id: string;
  name: string;
  type: InstitutionTypeEnum;
  pays: CountryType;
  description: string;
  website?: string | null;
  geographicZones: string[];
  logoUrl?: string | null;
}

export interface UpdateInstitutionUseCase
  extends UseCase<UpdateInstitutionCommand, InstitutionDTO> {}
