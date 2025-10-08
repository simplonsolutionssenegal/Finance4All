import type { InstitutionStatus } from '@/domain/institutions/entities/Institution';

export interface InstitutionDTO {
  id: string;
  name: string;
  description: string;
  website: string | null;
  geographicZones: string[];
  logoUrl: string | null;
  status: InstitutionStatus;
  createdAt: Date;
  updatedAt: Date;
}
