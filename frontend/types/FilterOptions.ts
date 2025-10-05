// frontend/types/FilterOptions.ts
import type { ServiceType } from './ServiceType';

export type DateFilter = '' | 'recent' | '3mois';

export interface FilterOptions {
  type: ServiceType[]; // ex: ['CREDIT', 'EPARGNE']
  zone: string[]; // UUID strings
  date: DateFilter; // '', 'recent', '3mois'
}
