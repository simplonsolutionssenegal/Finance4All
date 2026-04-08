import type { InstitutionStatsDTO } from '@/domain/institutions/value-objects/InstitutionStatsDTO';

describe('InstitutionStatsDTO', () => {
  it('should create a valid stats DTO', () => {
    const dto: InstitutionStatsDTO = {
      total: 25,
      active: 10,
      inactive: 7,
      pending: 8,
      archived: 0,
    };

    expect(dto.total).toBe(25);
    expect(dto.active).toBe(10);
    expect(dto.inactive).toBe(7);
    expect(dto.pending).toBe(8);
    expect(dto.archived).toBe(0);
  });

  it('should allow zero values for all counters', () => {
    const dto: InstitutionStatsDTO = {
      total: 0,
      active: 0,
      inactive: 0,
      pending: 0,
      archived: 0,
    };

    expect(dto).toEqual({
      total: 0,
      active: 0,
      inactive: 0,
      pending: 0,
      archived: 0,
    });
  });
});
