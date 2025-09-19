import type { RegionValue, InstitutionTypeValue } from './constants';

export interface Region {
  value: RegionValue;
  label: string;
}

export interface InstitutionType {
  value: InstitutionTypeValue;
  label: string;
}
