import type { TypeCalculation } from '@/domain/institutions/entities/Frais';

export interface FraisDTO {
  typeCalculation: TypeCalculation;
  montantFixe?: number;
  pourcentage?: number;
  minimum?: number;
  maximum?: number;
  fraisChange?: number;
  devise?: string;
}
