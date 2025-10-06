import type { UseCase } from '@/domain/shared/UseCase';
import type { InstitutionStatus } from '@/domain/institutions/entities/Institution';

export interface CreateInstitutionCommand {
  name: string;
  description: string;
  website?: string;
  geographicZones: string[];
  logoUrl?: string;
}

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

export interface CreateInstitutionUseCase
  extends UseCase<CreateInstitutionCommand, InstitutionDTO> {}
