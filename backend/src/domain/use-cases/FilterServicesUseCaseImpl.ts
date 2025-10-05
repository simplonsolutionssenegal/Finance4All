// application/use-cases/FilterServicesUseCaseImpl.ts
import type {
  FilterServicesUseCase,
  DatePreset,
} from '@/application/use-cases/FilterServicesUseCase';
import type { InstitutionService } from '@/domain/entities/InstitutionService';
import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { ServiceType } from '@/domain/entities/types/InstitutionServiceType';

const ALLOWED_TYPES: ServiceType[] = [
  'CREDIT',
  'EPARGNE',
  'MOBILE_MONEY',
  'INVESTISSEMENT',
  'ASSURANCE',
];

function computeFromDate(preset?: DatePreset): Date | undefined {
  if (!preset) return undefined;
  const now = new Date();
  if (preset === 'recent') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (preset === '3mois') {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 3);
    return d;
  }
  return undefined;
}

export class FilterServicesUseCaseImpl implements FilterServicesUseCase {
  constructor(private readonly repo: ServiceRepository) {}

  async execute(params: {
    institutionId: string;
    types?: ServiceType[];
    zoneCodes?: string[];
    datePreset?: DatePreset;
  }): Promise<InstitutionService[]> {
    const { institutionId, types, zoneCodes, datePreset } = params;

    // 👇 NEW: on vérifie d'abord que l’institution existe
    const exists = await this.repo.institutionExists(institutionId);
    if (!exists) {
      throw new Error('INSTITUTION_NOT_FOUND');
    }

    let cleanTypes: ServiceType[] | undefined;
    if (Array.isArray(types) && types.length) {
      cleanTypes = types
        .map(t => String(t).toUpperCase() as ServiceType)
        .filter((t): t is ServiceType => ALLOWED_TYPES.includes(t));
      if (!cleanTypes.length) cleanTypes = undefined;
    }

    let cleanZones: string[] | undefined;
    if (Array.isArray(zoneCodes) && zoneCodes.length > 0) {
      const z = zoneCodes.map(z => String(z).trim()).filter(Boolean);
      cleanZones = z.length > 0 ? z : undefined;
    }

    const fromDate = computeFromDate(datePreset);

    return this.repo.findByFilters(institutionId, cleanTypes, cleanZones, fromDate);
  }
}
