import type { InstitutionStatus } from '@/domain/institutions/entities/Institution';
import type { ServiceDTO } from '@/domain/institutions/value-objects/ServiceDTO';

export interface InstitutionDTO {
  id: string;
  name: string;
  description: string;
  website: string | null;
  geographicZones: string[];
  logoUrl: string | null;
  status: InstitutionStatus;
  services: ServiceDTO[];
  createdAt: Date;
  updatedAt: Date;
}
