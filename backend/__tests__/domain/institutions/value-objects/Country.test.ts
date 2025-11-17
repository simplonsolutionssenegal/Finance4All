import { Country } from '@/domain/institutions/value-objects/Country';

describe('Country', () => {
  it('should have SENEGAL as a valid value', () => {
    expect(Country.SENEGAL).toBe('SENEGAL');
  });

  it('should have CAMEROUN as a valid value', () => {
    expect(Country.CAMEROUN).toBe('CAMEROUN');
  });

  it('should only have two possible values', () => {
    const enumValues = Object.keys(Country).filter(key => isNaN(Number(key)));
    expect(enumValues).toHaveLength(2);
    expect(enumValues).toEqual(['SENEGAL', 'CAMEROUN']);
  });
});
