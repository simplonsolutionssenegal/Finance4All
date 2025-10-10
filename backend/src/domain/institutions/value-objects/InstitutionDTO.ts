import type { InstitutionStatus } from '@/domain/institutions/entities/Institution';
import type { Service } from '@/domain/institutions/entities/Service';

export interface InstitutionDTO {
  id: string;
  name: string;
  description: string;
  website: string | null;
  geographicZones: string[];
  logoUrl: string | null;
  status: InstitutionStatus;
  services: Service[];
  createdAt: Date;
  updatedAt: Date;
}
