import type { UseCase } from '@/domain/shared/UseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';

export interface UpdateInstitutionCommand {
  id: string;
  name: string;
  description: string;
  website?: string | null;
  geographicZones: string[];
  logoUrl?: string | null;
}

export interface UpdateInstitutionUseCase
  extends UseCase<UpdateInstitutionCommand, InstitutionDTO> {}
