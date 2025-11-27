import type { TypeCalculation } from '@/domain/institutions/entities/Frais';

export interface FraisDTO {
  typeCalculation: TypeCalculation;
  montantFixe?: number;
  pourcentage?: number;
  minimum?: number;
  maximum?: number;
  fraisChange?: FraisChangeDTO;
}

export interface FraisChangeDTO {
  fxSurcharge: number;
  devise: string;
}
