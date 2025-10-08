import {
  matchesSearchTerm,
  matchesServiceTypeFilter,
  matchesGeographicFilter,
  matchesInstitutFilter,
} from '@/components/services-financiers/ServicesDashboard';

import { financialServices } from '@/data/MockData';

describe('ServicesDashboard helpers', () => {
  it('matchesSearchTerm should match on designation, institution or type (case-insensitive)', () => {
    const s = financialServices[0];
    expect(matchesSearchTerm(s, 'épargne')).toBe(true);
    expect(matchesSearchTerm(s, 'société')).toBe(true);
    expect(matchesSearchTerm(s, 'EPARGNE')).toBe(true);
    expect(matchesSearchTerm(s, 'nonexistent')).toBe(false);
  });

  it("matchesServiceTypeFilter should map 'Assurance' to 'Autre type' and match correctly", () => {
    const service = { ...financialServices[0], type: 'Assurance' } as any;
    expect(matchesServiceTypeFilter(service, ['Autre type'])).toBe(true);
    expect(matchesServiceTypeFilter(service, ['Epargne'])).toBe(false);
    // empty filter returns true
    expect(matchesServiceTypeFilter(service, [])).toBe(true);
  });

  it('matchesGeographicFilter should replace label and check includes', () => {
    const service = financialServices.find(s => s.geographicZones.includes('Zone géographique A'))!;
    expect(matchesGeographicFilter(service, ['Zone Géo A'])).toBe(true);
    expect(matchesGeographicFilter(service, ['Zone Géo B'])).toBe(false);
    expect(matchesGeographicFilter(service, [])).toBe(true);
  });

  it('matchesInstitutFilter should handle allowed institut filter values and empty filters', () => {
    const service = financialServices[0];
    // The allowed filter values don't match the mock institution names, so expect false
    expect(matchesInstitutFilter(service, ['SIMPLON'])).toBe(false);
    expect(matchesInstitutFilter(service, ['ODK'])).toBe(false);
    expect(matchesInstitutFilter(service, [])).toBe(true);
  });
});
