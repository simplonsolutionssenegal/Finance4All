import type { Service } from '@/domain/entities/Service';
import type { ServiceType } from '@/domain/entities/types/ServiceType';

export type DatePreset = 'recent' | '3mois' | undefined;

export interface FilterServicesUseCase {
  execute(params: {
    institutionId: number;
    types?: ServiceType[]; // optionnel, plusieurs possibles
    zoneId?: number;
    datePreset?: DatePreset; // optionnel
  }): Promise<Service[]>;
}
