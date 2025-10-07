import {
  DATE_OPTIONS,
  EMPTY_FILTERS,
  TYPE_OPTIONS,
  ZONE_OPTIONS,
} from '@/components/institutions/filters/options';

describe('FilterOptions constants', () => {
  it('contient les bonnes valeurs pour TYPE_OPTIONS', () => {
    expect(TYPE_OPTIONS).toHaveLength(5);
    expect(TYPE_OPTIONS).toEqual([
      { value: 'CREDIT', label: 'Crédit' },
      { value: 'EPARGNE', label: 'Épargne' },
      { value: 'ASSURANCE', label: 'Assurance' },
      { value: 'MOBILE_MONEY', label: 'Mobile Money' },
      { value: 'INVESTISSEMENT', label: 'Investissement' },
    ]);
  });

  it('contient les bonnes valeurs pour ZONE_OPTIONS', () => {
    expect(ZONE_OPTIONS).toHaveLength(4);
    expect(ZONE_OPTIONS).toContainEqual({ value: 'DAKAR', label: 'Dakar' });
    expect(ZONE_OPTIONS).toContainEqual({ value: 'THIES', label: 'Thiès' });
  });

  it('contient les bonnes valeurs pour DATE_OPTIONS', () => {
    expect(DATE_OPTIONS).toHaveLength(2);
    expect(DATE_OPTIONS).toEqual([
      { value: 'recent', label: 'Récente' },
      { value: '3mois', label: 'Il y a 3 mois' },
    ]);
  });

  it('EMPTY_FILTERS doit être vide par défaut', () => {
    expect(EMPTY_FILTERS).toEqual({ type: [], zone: [], date: '' });
  });
});
