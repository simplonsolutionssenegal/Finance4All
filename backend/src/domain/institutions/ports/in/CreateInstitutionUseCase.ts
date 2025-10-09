import type { UseCase } from '@/domain/shared/UseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';

export interface CreateInstitutionCommand {
  name: string;
  description: string;
  website?: string;
  geographicZones: string[];
  logoUrl?: string;
}

export interface CreateInstitutionUseCase
  extends UseCase<CreateInstitutionCommand, InstitutionDTO> {}
