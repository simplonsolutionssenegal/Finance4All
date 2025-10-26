import type { UseCase } from '@/domain/shared/UseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type { TypeCalculation, TypeService } from '@/domain/institutions/entities/Service';

export interface FraisDTO {
  montantFixe?: number;
  pourcentage?: number;
  minimum?: number;
  maximum?: number;
  fraisChange?: number;
  devise?: string;
}

export interface AddServiceCommand {
  idInstitution: string;
  name: string;
  longName: string;
  type: TypeService;
  montantMin: number;
  montantMax: number;
  frais: FraisDTO;
  conditionAccess: string[];
  plafonds: string[];
  infrastructureAccess: string[];
}

export interface AddServiceUseCase extends UseCase<AddServiceCommand, InstitutionDTO> {}
