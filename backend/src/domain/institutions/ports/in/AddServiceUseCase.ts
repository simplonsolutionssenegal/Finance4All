import type { UseCase } from '@/domain/shared/UseCase';
import type { InstitutionDTO } from '@/domain/institutions/value-objects/InstitutionDTO';
import type { Frais } from '@/domain/institutions/entities/Frais';
import type { TypeService } from '@/domain/institutions/entities/Service';

export interface AddServiceCommand {
  name: string;
  longName: string;
  type: TypeService;
  frais: Frais;
  conditionAccess: string[];
  plafonds: string[];
  infrastructureAccess: string[];
}

export interface AddServiceUseCase extends UseCase<AddServiceCommand, InstitutionDTO> {}
