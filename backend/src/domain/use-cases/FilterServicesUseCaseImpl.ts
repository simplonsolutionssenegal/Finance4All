import type {
  FilterServicesUseCase,
  DatePreset,
} from '@/application/use-cases/FilterServicesUseCase';
import type { Service } from '@/domain/entities/Service';
import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { ServiceType } from '@/domain/entities/types/ServiceType';
// import { ServiceType } from '@/domain/entities/Service';

const ALLOWED_TYPES: ServiceType[] = ['CREDIT', 'EPARGNE', 'MOBILE_MONEY'];

function computeFromDate(preset?: DatePreset): Date | undefined {
  if (!preset) return undefined;
  const now = new Date();
  if (preset === 'recent') {
    const d = new Date(now);
    d.setDate(d.getDate() - 7); // 7 derniers jours
    return d;
  }
  if (preset === '3mois') {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 3); // 3 derniers mois
    return d;
  }
  return undefined;
}

export class FilterServicesUseCaseImpl implements FilterServicesUseCase {
  constructor(private readonly repo: ServiceRepository) {}

  async execute(params: {
    institutionId: number;
    types?: ServiceType[];
    zoneId?: number;
    datePreset?: DatePreset;
  }): Promise<Service[]> {
    const { institutionId, types, zoneId, datePreset } = params;

    if (!Number.isFinite(institutionId) || institutionId <= 0) {
      throw new Error('institutionId invalide');
    }

    let cleanTypes: ServiceType[] | undefined;
    if (Array.isArray(types) && types.length) {
      cleanTypes = types
        .map(t => String(t).toUpperCase() as ServiceType)
        .filter((t): t is ServiceType => ALLOWED_TYPES.includes(t));
      if (!cleanTypes.length) cleanTypes = undefined;
    }

    // const cleanZone = Number.isFinite(zoneId!) ? Number(zoneId) : undefined;
    const cleanZone = typeof zoneId === 'number' && Number.isFinite(zoneId) ? zoneId : undefined;
    const fromDate = computeFromDate(datePreset);

    return this.repo.findByFilters(institutionId, cleanTypes, cleanZone, fromDate);
  }
}
