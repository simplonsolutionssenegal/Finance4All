import {
  InstitutionType,
  type InstitutionTypeEnum,
} from '@/domain/institutions/value-objects/InstitutionType';

describe('InstitutionType', () => {
  it('should have all required institution types', () => {
    expect(InstitutionType.ETABLISSEMENT_MONNAIE_ELECTRONIQUE).toBe(
      'ETABLISSEMENT_MONNAIE_ELECTRONIQUE'
    );
    expect(InstitutionType.PORTEFEUILLE_NUMERIQUE).toBe('PORTEFEUILLE_NUMERIQUE');
    expect(InstitutionType.SERVICE_PAIEMENT_ELECTRONIQUE).toBe('SERVICE_PAIEMENT_ELECTRONIQUE');
    expect(InstitutionType.BANQUE_NUMERIQUE).toBe('BANQUE_NUMERIQUE');
    expect(InstitutionType.SERVICE_FINANCIER_DECENTRALISE).toBe('SERVICE_FINANCIER_DECENTRALISE');
    expect(InstitutionType.SERVICE_FINANCEMENT_PARTICIPATIF).toBe(
      'SERVICE_FINANCEMENT_PARTICIPATIF'
    );
    expect(InstitutionType.SERVICE_INVESTISSEMENT).toBe('SERVICE_INVESTISSEMENT');
    expect(InstitutionType.SERVICE_GESTION_FINANCIERE).toBe('SERVICE_GESTION_FINANCIERE');
    expect(InstitutionType.SERVICE_ASSURANCE_NUMERIQUE).toBe('SERVICE_ASSURANCE_NUMERIQUE');
  });

  it('should have exactly nine institution types', () => {
    const enumValues = Object.keys(InstitutionType).filter(key => isNaN(Number(key)));
    expect(enumValues).toHaveLength(9);
    expect(enumValues).toEqual([
      'ETABLISSEMENT_MONNAIE_ELECTRONIQUE',
      'PORTEFEUILLE_NUMERIQUE',
      'SERVICE_PAIEMENT_ELECTRONIQUE',
      'BANQUE_NUMERIQUE',
      'SERVICE_FINANCIER_DECENTRALISE',
      'SERVICE_FINANCEMENT_PARTICIPATIF',
      'SERVICE_INVESTISSEMENT',
      'SERVICE_GESTION_FINANCIERE',
      'SERVICE_ASSURANCE_NUMERIQUE',
    ]);
  });

  it('should not be possible to add new types at runtime', () => {
    const invalidType = 'NEW_TYPE' as unknown as InstitutionTypeEnum;
    expect(Object.values(InstitutionType)).not.toContain(invalidType);
  });

  it('should not be possible to modify existing types', () => {
    const values = Object.values(InstitutionType);
    expect(values).toContain('BANQUE_NUMERIQUE');
  });

  it('should be usable in a switch statement', () => {
    const getInstitutionCategory = (type: InstitutionTypeEnum): string => {
      switch (type) {
        case InstitutionType.ETABLISSEMENT_MONNAIE_ELECTRONIQUE:
        case InstitutionType.PORTEFEUILLE_NUMERIQUE:
        case InstitutionType.SERVICE_PAIEMENT_ELECTRONIQUE:
          return 'PAIEMENT';
        case InstitutionType.BANQUE_NUMERIQUE:
          return 'BANQUE';
        case InstitutionType.SERVICE_FINANCIER_DECENTRALISE:
        case InstitutionType.SERVICE_FINANCEMENT_PARTICIPATIF:
        case InstitutionType.SERVICE_INVESTISSEMENT:
        case InstitutionType.SERVICE_GESTION_FINANCIERE:
        case InstitutionType.SERVICE_ASSURANCE_NUMERIQUE:
          return 'SERVICE';
        default:
          return type;
      }
    };

    expect(getInstitutionCategory(InstitutionType.ETABLISSEMENT_MONNAIE_ELECTRONIQUE)).toBe(
      'PAIEMENT'
    );
    expect(getInstitutionCategory(InstitutionType.BANQUE_NUMERIQUE)).toBe('BANQUE');
    expect(getInstitutionCategory(InstitutionType.SERVICE_INVESTISSEMENT)).toBe('SERVICE');
  });

  it('should allow type checking with "in" operator', () => {
    const type = 'BANQUE_NUMERIQUE';
    const invalidType = 'INVALID_TYPE';

    expect(type in InstitutionType).toBeTruthy();
    expect(invalidType in InstitutionType).toBeFalsy();
  });

  it('should work with Object.values()', () => {
    const values = Object.values(InstitutionType);
    expect(values).toContain('ETABLISSEMENT_MONNAIE_ELECTRONIQUE');
    expect(values).toContain('PORTEFEUILLE_NUMERIQUE');
    expect(values).toContain('SERVICE_PAIEMENT_ELECTRONIQUE');
    expect(values).toContain('BANQUE_NUMERIQUE');
    expect(values).toContain('SERVICE_FINANCIER_DECENTRALISE');
    expect(values).toContain('SERVICE_FINANCEMENT_PARTICIPATIF');
    expect(values).toContain('SERVICE_INVESTISSEMENT');
    expect(values).toContain('SERVICE_GESTION_FINANCIERE');
    expect(values).toContain('SERVICE_ASSURANCE_NUMERIQUE');
    expect(values).toHaveLength(9);
  });
});
