import type { InstitutionStatus } from '@/domain/institutions/entities/Institution';
import type { ServiceDTO } from '@/domain/institutions/value-objects/ServiceDTO';
import type { InstitutionTypeEnum } from './InstitutionType';
import type { CountryType } from './Country';

export interface InstitutionDTO {
  id: string;
  name: string;
  description: string;
  website: string | null;
  geographicZones: string[];
  logoUrl: string | null;
  type: InstitutionTypeEnum;
  pays: CountryType;
  status: InstitutionStatus;
  services: ServiceDTO[];
  createdAt: Date;
  updatedAt: Date;
}
