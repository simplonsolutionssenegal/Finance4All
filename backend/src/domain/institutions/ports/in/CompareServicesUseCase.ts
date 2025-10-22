// domain/institutions/use-cases/CompareServicesUseCase.ts
import type { TypeService } from '@/domain/institutions/entities/Service';

export interface ServiceComparisonDTO {
  serviceId: string;
  institutionId: string;
  institutionName: string;
  serviceName: string;
  serviceLongName: string;
  type: TypeService;
  frais: {
    description: string;
    montantFixe?: number;
    pourcentage?: number;
    minimum?: number;
    maximum?: number;
    isGratuit: boolean;
  };
  conditionAccess: string[];
  plafonds: string[];
  infrastructureAccess: string[];
}

export interface ComparisonResultDTO {
  type: TypeService;
  services: ServiceComparisonDTO[];
  commonalities: {
    infrastructureAccess: string[];
    conditionAccess: string[];
    plafonds: string[];
  };
  differences: {
    serviceId: string;
    institutionName: string;
    uniqueInfrastructure: string[];
    uniqueConditions: string[];
    uniquePlafonds: string[];
  }[];
  cheapestService: {
    serviceId: string;
    institutionName: string;
    serviceName: string;
    reason: string;
  } | null;
  analysis: string;
}

export interface CompareServicesRequest {
  serviceIds: string[];
}

export interface CompareServicesUseCase {
  execute(request: CompareServicesRequest): Promise<ComparisonResultDTO>;
}
