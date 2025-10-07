// frontend/types/FilterOptions.ts
import { ProductType } from './ProductType';

export type DateFilter = '' | 'recent' | '3mois';

export interface FilterOptions {
  type: ProductType[]; // ex: ['CREDIT', 'EPARGNE']
  zone: string[]; // UUID strings
  date: DateFilter; // '', 'recent', '3mois'
}
