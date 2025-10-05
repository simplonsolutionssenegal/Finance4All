import type { DateFilter, FilterOptions } from '@/types/FilterOptions';
import type { ServiceType } from '@/types/ServiceType';

export type SelectOption<T extends string> = { value: T; label: string };

export const TYPE_OPTIONS: ReadonlyArray<SelectOption<ServiceType>> = [
  { value: 'EPARGNE', label: 'Épargne' },
  { value: 'CREDIT', label: 'Crédit' },
  { value: 'MOBILE_MONEY', label: 'Mobile Money' },
  { value: 'INVESTISSEMENT', label: 'Investissement' },
  { value: 'ASSURANCE', label: 'Assurance' },
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
