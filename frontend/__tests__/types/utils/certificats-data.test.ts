import { CERTIFICAT_HEADER_STATS, CERTIFICATS_MOCK } from '@/types/utils/certificats-data';

describe('certificats-data', () => {
  it('matches expected header labels and values order', () => {
    expect(CERTIFICAT_HEADER_STATS.map(item => item.label)).toEqual([
      'Certificats obtenus',
      'Modules completes',
      "Temps d'apprentissage",
      'Taux de reussite',
    ]);
    expect(CERTIFICAT_HEADER_STATS.map(item => item.value)).toEqual([
      '3',
      '8/26',
      '24h 30m',
      '85%',
    ]);
  });

  it('provides 4 header stats with icon and values', () => {
    expect(CERTIFICAT_HEADER_STATS).toHaveLength(4);
    CERTIFICAT_HEADER_STATS.forEach(stat => {
      expect(stat.label).toBeTruthy();
      expect(stat.value).toBeTruthy();
      expect(stat.icon).toBeDefined();
    });
  });

  it('provides 3 certificate mocks with valid score and level', () => {
    expect(CERTIFICATS_MOCK).toHaveLength(3);
    CERTIFICATS_MOCK.forEach(item => {
      expect(item.id).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(100);
      expect(['Excellence', 'Tres Bien']).toContain(item.level);
    });
  });

  it('matches expected certificate ids and titles', () => {
    expect(CERTIFICATS_MOCK.map(item => item.id)).toEqual([
      'expert-mobile-money',
      'maitre-du-budget',
      'gestion-de-credit',
    ]);
    expect(CERTIFICATS_MOCK.map(item => item.title)).toEqual([
      'Expert Mobile Money',
      'Maitre du Budget',
      'Gestion de Credit',
    ]);
  });
});
