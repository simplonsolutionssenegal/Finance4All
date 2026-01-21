import {
  serviceSchema,
  inferFeeTypeUI,
  normalizeTypeService,
  toFormDefaults,
  toServicePayload,
  Currency,
  type FeeTypeUI,
  type ServiceFormData,
} from '@/lib/serviceForm.shared';
import { TypeService } from '@/types/Service';

describe('serviceSchema', () => {
  describe('Validation des champs de base', () => {
    it('devrait valider un service valide minimal', () => {
      const validData = {
        name: 'Service Test',
        longName: 'Description du service',
        type: TypeService.PAIEMENT_MARCHAND,
        montantMin: 0,
        montantMax: 100,
        feeTypeUI: 'FREE' as FeeTypeUI,
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter un nom trop court', () => {
      const invalidData = {
        name: 'AB',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'FREE',
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('nom service est obligatoire');
      }
    });

    it('devrait rejeter une description vide', () => {
      const invalidData = {
        name: 'Service Test',
        longName: '',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'FREE',
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('description est obligatoire');
      }
    });

    it('devrait rejeter un type de service invalide', () => {
      const invalidData = {
        name: 'Service Test',
        longName: 'Description',
        type: 'INVALID_TYPE',
        feeTypeUI: 'FREE',
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Validation montantMin et montantMax', () => {
    it('devrait accepter montantMin < montantMax', () => {
      const validData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        montantMin: 100,
        montantMax: 500,
        feeTypeUI: 'FREE' as FeeTypeUI,
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter montantMin > montantMax', () => {
      const invalidData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        montantMin: 500,
        montantMax: 100,
        feeTypeUI: 'FREE',
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('montantMin'))).toBe(true);
        expect(result.error.issues.some(i => i.path.includes('montantMax'))).toBe(true);
      }
    });

    it('devrait accepter montantMin === montantMax', () => {
      const validData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        montantMin: 100,
        montantMax: 100,
        feeTypeUI: 'FREE' as FeeTypeUI,
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Validation feeTypeUI: FREE', () => {
    it('devrait accepter FREE sans frais', () => {
      const validData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'FREE' as FeeTypeUI,
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter FREE avec des frais', () => {
      const invalidData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'FREE',
        frais: {
          montantFixe: 100,
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('gratuit');
      }
    });
  });

  describe('Validation feeTypeUI: FIX', () => {
    it('devrait accepter FIX avec montantFixe', () => {
      const validData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'FIX' as FeeTypeUI,
        frais: {
          montantFixe: 500,
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter FIX sans montantFixe', () => {
      const invalidData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'FIX',
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('montant fixe est obligatoire');
      }
    });
  });

  describe('Validation feeTypeUI: POURCENTAGE', () => {
    it('devrait accepter POURCENTAGE avec pourcentage valide', () => {
      const validData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'POURCENTAGE' as FeeTypeUI,
        frais: {
          pourcentage: 2.5,
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter POURCENTAGE sans pourcentage', () => {
      const invalidData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'POURCENTAGE',
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('pourcentage est obligatoire');
      }
    });

    it('devrait rejeter pourcentage > 100', () => {
      const invalidData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'POURCENTAGE',
        frais: {
          pourcentage: 150,
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('≤ 100');
      }
    });

    it('devrait rejeter minimum > maximum', () => {
      const invalidData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'POURCENTAGE',
        frais: {
          pourcentage: 2.5,
          minimum: 1000,
          maximum: 500,
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('minimum doit être ≤ maximum');
      }
    });
  });

  describe('Validation feeTypeUI: MIXTE', () => {
    it('devrait accepter MIXTE avec montantFixe et pourcentage', () => {
      const validData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'MIXTE' as FeeTypeUI,
        frais: {
          montantFixe: 100,
          pourcentage: 2.5,
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter MIXTE sans montantFixe', () => {
      const invalidData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'MIXTE',
        frais: {
          pourcentage: 2.5,
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('montant fixe'))).toBe(true);
      }
    });

    it('devrait rejeter MIXTE sans pourcentage', () => {
      const invalidData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'MIXTE',
        frais: {
          montantFixe: 100,
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.message.includes('pourcentage'))).toBe(true);
      }
    });
  });

  describe('Validation feeTypeUI: CHANGE', () => {
    it('devrait accepter CHANGE avec fraisChange complet', () => {
      const validData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'CHANGE' as FeeTypeUI,
        frais: {
          fraisChange: {
            fxSurcharge: 50,
            devise: Currency.EUR,
          },
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('devrait rejeter CHANGE sans fraisChange', () => {
      const invalidData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'CHANGE',
        frais: {},
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('frais de change sont obligatoires');
      }
    });

    it('devrait rejeter CHANGE sans devise', () => {
      const invalidData = {
        name: 'Service Test',
        longName: 'Description',
        type: TypeService.PAIEMENT_MARCHAND,
        feeTypeUI: 'CHANGE',
        frais: {
          fraisChange: {
            fxSurcharge: 50,
          },
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      const result = serviceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('inferFeeTypeUI', () => {
  it('devrait retourner FREE si pas de frais', () => {
    expect(inferFeeTypeUI(null)).toBe('FREE');
    expect(inferFeeTypeUI({})).toBe('FREE');
  });

  it('devrait retourner CHANGE si fraisChange existe', () => {
    const frais = {
      fraisChange: { fxSurcharge: 50, devise: Currency.EUR },
    };
    expect(inferFeeTypeUI(frais)).toBe('CHANGE');
  });

  it('devrait retourner MIXTE si montantFixe et pourcentage', () => {
    const frais = {
      montantFixe: 100,
      pourcentage: 2.5,
    };
    expect(inferFeeTypeUI(frais)).toBe('MIXTE');
  });

  it('devrait retourner FIX si seulement montantFixe', () => {
    const frais = {
      montantFixe: 100,
    };
    expect(inferFeeTypeUI(frais)).toBe('FIX');
  });

  it('devrait retourner POURCENTAGE si pourcentage ou min/max', () => {
    expect(inferFeeTypeUI({ pourcentage: 2.5 })).toBe('POURCENTAGE');
    expect(inferFeeTypeUI({ minimum: 100 })).toBe('POURCENTAGE');
    expect(inferFeeTypeUI({ maximum: 500 })).toBe('POURCENTAGE');
  });
});

describe('normalizeTypeService', () => {
  it('devrait retourner le type si valide', () => {
    expect(normalizeTypeService(TypeService.PAIEMENT_MARCHAND)).toBe(TypeService.PAIEMENT_MARCHAND);
  });

  it('devrait normaliser les strings en majuscule', () => {
    expect(normalizeTypeService('paiement_marchand')).toBe(TypeService.PAIEMENT_MARCHAND);
    expect(normalizeTypeService('ACHAT_CREDIT')).toBe(TypeService.ACHAT_CREDIT);
  });

  it('devrait retourner AUTRES pour type invalide', () => {
    expect(normalizeTypeService('INVALID')).toBe(TypeService.AUTRES);
    expect(normalizeTypeService(123)).toBe(TypeService.AUTRES);
    expect(normalizeTypeService(null)).toBe(TypeService.AUTRES);
  });
});

describe('toFormDefaults', () => {
  it('devrait convertir un service en FormData avec valeurs par défaut', () => {
    const service = {
      name: 'Test Service',
      longName: 'Test Description',
      type: TypeService.PAIEMENT_MARCHAND,
    };

    const result = toFormDefaults(service);

    expect(result.name).toBe('Test Service');
    expect(result.longName).toBe('Test Description');
    expect(result.type).toBe(TypeService.PAIEMENT_MARCHAND);
    expect(result.montantMin).toBe(0);
    expect(result.montantMax).toBe(0);
    expect(result.feeTypeUI).toBe('FREE');
    expect(result.frais.montantFixe).toBe(0);
    expect(result.frais.pourcentage).toBe(0);
  });

  it('devrait convertir pourcentage décimal en pourcentage UI (*100)', () => {
    const service = {
      name: 'Test',
      longName: 'Test',
      type: TypeService.PAIEMENT_MARCHAND,
      frais: {
        pourcentage: 0.025, // 2.5% en décimal
      },
    };

    const result = toFormDefaults(service);
    expect(result.frais.pourcentage).toBe(2.5);
  });

  it('devrait préserver fraisChange', () => {
    const service = {
      name: 'Test',
      longName: 'Test',
      type: TypeService.PAIEMENT_MARCHAND,
      frais: {
        fraisChange: {
          fxSurcharge: 50,
          devise: Currency.EUR,
        },
      },
    };

    const result = toFormDefaults(service);
    expect(result.frais.fraisChange).toEqual({
      fxSurcharge: 50,
      devise: Currency.EUR,
    });
    expect(result.feeTypeUI).toBe('CHANGE');
  });
});

describe('toServicePayload', () => {
  it('devrait convertir FormData en payload backend', () => {
    const formData: ServiceFormData = {
      name: 'Test Service',
      longName: 'Description',
      type: TypeService.PAIEMENT_MARCHAND,
      montantMin: 100,
      montantMax: 500,
      feeTypeUI: 'FIX',
      frais: {
        montantFixe: 50,
      },
      conditionAccess: ['condition1'],
      plafonds: ['plafond1'],
      infrastructureAccess: ['infra1'],
    };

    const result = toServicePayload(formData);

    expect(result.name).toBe('Test Service');
    expect(result.montantMin).toBe(100);
    expect(result.montantMax).toBe(500);
    expect(result.frais.montantFixe).toBe(50);
    expect('feeTypeUI' in result).toBe(false); // feeTypeUI ne doit pas être dans le payload
  });

  it('devrait gérer les valeurs undefined comme 0', () => {
    const formData: ServiceFormData = {
      name: 'Test',
      longName: 'Test',
      type: TypeService.PAIEMENT_MARCHAND,
      feeTypeUI: 'FREE',
      frais: {},
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = toServicePayload(formData);

    expect(result.montantMin).toBe(0);
    expect(result.montantMax).toBe(0);
    expect(result.frais.montantFixe).toBe(0);
    expect(result.frais.minimum).toBe(0);
    expect(result.frais.maximum).toBe(0);
  });

  it('devrait préserver pourcentage si défini', () => {
    const formData: ServiceFormData = {
      name: 'Test',
      longName: 'Test',
      type: TypeService.PAIEMENT_MARCHAND,
      feeTypeUI: 'POURCENTAGE',
      frais: {
        pourcentage: 2.5,
      },
      conditionAccess: [],
      plafonds: [],
      infrastructureAccess: [],
    };

    const result = toServicePayload(formData);
    expect(result.frais.pourcentage).toBe(2.5);
  });
});
