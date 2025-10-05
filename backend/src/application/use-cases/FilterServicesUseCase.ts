// application/use-cases/FilterServicesUseCase.ts
import type { InstitutionService } from '@/domain/entities/InstitutionService';
import type { ServiceType } from '@/domain/entities/types/InstitutionServiceType';

export type DatePreset = 'recent' | '3mois' | undefined;

export interface FilterServicesUseCase {
  execute(params: {
    institutionId: string;
    types?: ServiceType[];
    zoneCodes?: string[]; // tableau de zones
    datePreset?: DatePreset;
  }): Promise<InstitutionService[]>;
}
