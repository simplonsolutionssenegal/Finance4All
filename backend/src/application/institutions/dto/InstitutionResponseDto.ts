import type { InstitutionStatus } from '@/domain/institutions/entities/Institution';

export interface InstitutionResponseDto {
  id: string;
  name: string;
  description: string;
  website: string | null;
  geographicZones: string[];
  status: InstitutionStatus;
  logoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
