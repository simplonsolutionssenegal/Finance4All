import {
  TYPE_OPTIONS,
  ZONE_OPTIONS,
  DATE_OPTIONS,
  EMPTY_FILTERS,
} from '@/components/institutions/filters/options';
import type { ServiceType } from '@/types/ServiceType';
import type { DateFilter } from '@/types/FilterOptions';

describe('filters/options', () => {
  it('TYPE_OPTIONS contient les valeurs attendues (typiées ServiceType)', () => {
    const values = TYPE_OPTIONS.map(o => o.value);
    const expected: ServiceType[] = [
      'EPARGNE',
      'CREDIT',
      'MOBILE_MONEY',
      'INVESTISSEMENT',
      'ASSURANCE',
    ];
    expect(values).toEqual(expected);
  });

  it('ZONE_OPTIONS contient des zones simples (string)', () => {
    expect(ZONE_OPTIONS.map(o => o.value)).toEqual(['DAKAR', 'THIES', 'MBOUR', 'FATICK']);
  });

  it('DATE_OPTIONS contient les valeurs attendues (typiées DateFilter)', () => {
    const values = DATE_OPTIONS.map(o => o.value);
    const expected: DateFilter[] = ['recent', '3mois'];
    expect(values).toEqual(expected);
  });

  it('EMPTY_FILTERS est bien vide et typé', () => {
    expect(EMPTY_FILTERS).toEqual({ type: [], zone: [], date: '' });
  });
});
