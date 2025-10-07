// application/use-cases/FilterProductUseCase.ts
import type { Product } from '@/domain/entities/Product';
import type { ProductType } from '@/domain/entities/types/ProductType';

export type DatePreset = 'recent' | '3mois' | undefined;

export interface FilterProductUseCase {
  execute(params: {
    institutionId: string;
    types?: ProductType[];
    zoneCodes?: string[];
    datePreset?: DatePreset;
  }): Promise<Product[]>;
}
