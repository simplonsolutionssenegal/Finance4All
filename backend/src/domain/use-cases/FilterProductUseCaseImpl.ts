// application/use-cases/FilterProductUseCaseImpl.ts
import type {
  FilterProductUseCase,
  DatePreset,
} from '@/application/use-cases/FilterProductUseCase';
import type { Product } from '@/domain/entities/Product';
import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import { ProductType } from '@/domain/entities/types/ProductType';

const ALLOWED_TYPES: readonly ProductType[] = [
  ProductType.CREDIT,
  ProductType.EPARGNE,
  ProductType.MOBILE_MONEY,
  ProductType.INVESTISSEMENT,
  ProductType.ASSURANCE,
] as const;

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

export class FilterProductUseCaseImpl implements FilterProductUseCase {
  constructor(private readonly repo: ProductRepository) {}

  async execute(params: {
    institutionId: string;
    types?: ProductType[]; // ✅ déjà des enums
    zoneCodes?: string[];
    datePreset?: DatePreset;
  }): Promise<Product[]> {
    const { institutionId, types, zoneCodes, datePreset } = params;

    const exists = await this.repo.institutionExists(institutionId);
    if (!exists) throw new Error('INSTITUTION_NOT_FOUND');

    const cleanTypes = types?.length ? types.filter(t => ALLOWED_TYPES.includes(t)) : undefined;

    const cleanZones = zoneCodes?.length
      ? zoneCodes.map(z => String(z).trim()).filter(Boolean)
      : undefined;

    const fromDate = computeFromDate(datePreset);

    return this.repo.findByFilters(institutionId, cleanTypes, cleanZones, fromDate);
  }
}
