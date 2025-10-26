import type { FraisDTO } from '@/domain/institutions/value-objects/FraisDTO';
import type { TypeService, TypeCalculation } from '@/domain/institutions/entities/Service';

export interface ServiceDTO {
  id: string;
  name: string;
  longName: string;
  type: TypeService;
  typeFrais: TypeCalculation;
  frais: FraisDTO;
  conditionAccess: string[];
  plafonds: string[];
  infrastructureAccess: string[];
}
