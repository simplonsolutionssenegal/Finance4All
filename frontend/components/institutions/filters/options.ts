import type { DateFilter, FilterOptions } from '@/types/FilterOptions';
import type { ProductType } from '@/types/ProductType';

export type SelectOption<T extends string> = { value: T; label: string };

export const TYPE_OPTIONS: ReadonlyArray<SelectOption<ProductType>> = [
  { value: 'CREDIT', label: 'Crédit' },
  { value: 'EPARGNE', label: 'Épargne' },
  { value: 'ASSURANCE', label: 'Assurance' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'INVESTISSEMENT', label: 'Investissement' },
] as const;

export const ZONE_OPTIONS: ReadonlyArray<SelectOption<string>> = [
  { value: 'DAKAR', label: 'Dakar' },
  { value: 'THIES', label: 'Thiès' },
  { value: 'MBOUR', label: 'Mbour' },
  { value: 'FATICK', label: 'Fatick' },
] as const;

export const DATE_OPTIONS: ReadonlyArray<SelectOption<DateFilter>> = [
  { value: 'recent', label: 'Récente' },
  { value: '3mois', label: 'Il y a 3 mois' },
] as const;

export const EMPTY_FILTERS: FilterOptions = { type: [], zone: [], date: '' };
