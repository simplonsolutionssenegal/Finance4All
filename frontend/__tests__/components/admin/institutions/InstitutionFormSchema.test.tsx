import {
  institutionSchema,
  removeZone,
} from '@/components/admin/institutions/shared/InstitutionFormSchema';

describe('institutionSchema', () => {
  it('accepts valid data', () => {
    const data = {
      name: 'My Bank',
      description: 'A valid description with enough characters',
      website: 'https://example.com',
      geographicZones: ['EURO'],
      logoUrl: 'https://example.com/logo.png',
      type: 'BANQUE_NUMERIQUE',
      pays: 'SENEGAL',
    } as const;

    const result = institutionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects when name is too short', () => {
    const result = institutionSchema.safeParse({
      name: 'A',
      description: 'Description long enough',
      geographicZones: ['EURO'],
      type: 'BANQUE_NUMERIQUE',
      pays: 'SENEGAL',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.format().name?._errors?.length).toBeGreaterThan(0);
  });

  it('allows empty string for optional urls', () => {
    const data = {
      name: 'My Bank',
      description: 'A valid description with enough characters',
      website: '',
      geographicZones: ['EURO'],
      logoUrl: '',
      type: 'BANQUE_NUMERIQUE',
      pays: 'SENEGAL',
    } as const;
    const result = institutionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('requires at least one geographic zone', () => {
    const result = institutionSchema.safeParse({
      name: 'Bank',
      description: 'A valid description with enough characters',
      geographicZones: [],
      type: 'BANQUE_NUMERIQUE',
      pays: 'SENEGAL',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid enum values', () => {
    const result = institutionSchema.safeParse({
      name: 'Bank',
      description: 'A valid description with enough characters',
      geographicZones: ['EURO'],
      type: 'INVALID_TYPE',
      pays: 'INVALID_COUNTRY',
    } as any);
    expect(result.success).toBe(false);
  });

  it('accepts undefined for optional urls', () => {
    const data = {
      name: 'My Bank',
      description: 'A valid description with enough characters',
      geographicZones: ['EURO'],
      // website and logoUrl omitted (undefined)
      type: 'BANQUE_NUMERIQUE',
      pays: 'SENEGAL',
    } as any;

    const result = institutionSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('removeZone helper removes correctly and handles undefined', () => {
    expect(removeZone(['EURO', 'USD', 'Pacifique'], 'USD')).toEqual(['EURO', 'Pacifique']);
    expect(removeZone(undefined, 'USD')).toEqual([]);
  });
});
