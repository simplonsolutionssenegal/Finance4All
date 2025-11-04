import type { FraisDTO } from '@/domain/institutions/value-objects/FraisDTO';
import type { TypeService } from '@/domain/institutions/entities/Service';

export interface ServiceDTO {
  id: string;
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
