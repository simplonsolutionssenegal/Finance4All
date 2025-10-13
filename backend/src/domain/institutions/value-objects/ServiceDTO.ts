import type { Frais } from '@/domain/institutions/entities/Frais';
import type { TypeService } from '@/domain/institutions/entities/Service';

export interface ServiceDTO {
  id: string;
  name: string;
  longName: string;
  type: TypeService;
  frais: Frais;
  conditionAccess: string[];
  plafonds: string[];
  infrastructureAccess: string[];
}
