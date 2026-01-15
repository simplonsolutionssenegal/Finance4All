import type { UseCase } from '@/domain/shared/UseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type { TypeService } from '@/domain/institutions/entities/Service';

export type FraisChangeDTO = {
  fxSurcharge: number;
  devise: string;
};

export interface FraisDTO {
  montantFixe?: number;
  pourcentage?: number;
  minimum?: number;
  maximum?: number;
  fraisChange?: FraisChangeDTO;
}

export interface UpdateServiceCommand {
  idInstitution: string;
  idService: string;

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

export interface UpdateServiceUseCase extends UseCase<UpdateServiceCommand, InstitutionDTO> {}
