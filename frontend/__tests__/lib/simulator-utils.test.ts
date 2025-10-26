import type { SimulationParams } from '@/lib/simulator-types';
import { calculateEstimation } from '@/lib/simulator-utils';
import { TypeCalculation, TypeService, type Service } from '@/types/Service';

// Mock data pour les tests
const createMockService = (type: TypeService, frais: any = {}): Service => ({
  id: 'test-service',
  name: 'Test Service',
  longName: 'Test Service Description',
  type,

  frais: {
    type: 'POURCENTAGE',
    rate: 0.035,
    maximum: 10000,
    minimum: 0,
    ...frais,
  },
  conditionAccess: [],
  plafonds: ['1000-100000', '1-10'],
  infrastructureAccess: [],
  institutionId: 'test-institution',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('simulator-utils', () => {
  describe('calculateEstimation', () => {
    it('should return default estimation when no service', () => {
      const params: SimulationParams = {
        institution: null,
        service: null,
        amount: 100000,
        selectedPlafondIndex: 0,
      };

      const result = calculateEstimation(params);

      expect(result).toEqual({
        serviceType: 'Aucun service sélectionné',
        feeDescription: 'Aucun frais',
      });
    });

    describe('CREDIT type', () => {
      const creditService = createMockService(TypeService.CREDIT, {
        type: 'POURCENTAGE',
        rate: 0.035,
      });

      it('should calculate credit estimation correctly', () => {
        const params: SimulationParams = {
          institution: null,
          service: creditService,
          amount: 100000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('monthlyPayment');
        expect(result).toHaveProperty('totalInterest');
        expect(result).toHaveProperty('totalCost');
        expect(result).toHaveProperty('serviceType');
        expect(result).toHaveProperty('feeDescription');
        expect(result.serviceType).toBe(TypeService.CREDIT);
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });

      it('should include service fees in credit calculation', () => {
        const serviceWithFees = createMockService(TypeService.CREDIT, {
          type: 'FIX',
          amount: 500,
          rate: 0.035,
        });

        const params: SimulationParams = {
          institution: null,
          service: serviceWithFees,
          amount: 100000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result.monthlyPayment).toBeGreaterThan(0);
        expect(result.feeDescription).toContain('3.50%');
        expect(result.feeDescription).toContain('500');
      });
    });

    describe('EPARGNE type', () => {
      const epargneService = createMockService(TypeService.EPARGNE, {
        type: 'POURCENTAGE',
        rate: 0.025,
      });

      it('should calculate savings estimation correctly', () => {
        const params: SimulationParams = {
          institution: null,
          service: epargneService,
          amount: 50000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('finalAmount');
        expect(result).toHaveProperty('totalGain');
        expect(result).toHaveProperty('annualRate');
        expect(result).toHaveProperty('serviceType');
        expect(result).toHaveProperty('feeDescription');
        expect(result.serviceType).toBe(TypeService.EPARGNE);
        expect(result.finalAmount).toBeGreaterThan(50000 + 1000); // Les frais s'ajoutent au montant
        expect(result.annualRate).toBe(0); // Pas de taux défini dans le service
      });
    });

    describe('PAIEMENT_MARCHAND type', () => {
      const paiementService = createMockService(TypeService.PAIEMENT_MARCHAND, {
        type: 'FIX',
        amount: 100,
        rate: 0.015,
      });

      it('should calculate payment fees correctly', () => {
        const params: SimulationParams = {
          institution: null,
          service: paiementService,
          amount: 10000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('totalFees');
        expect(result).toHaveProperty('netAmount');
        expect(result).toHaveProperty('serviceType');
        expect(result).toHaveProperty('feeDescription');
        expect(result.serviceType).toBe(TypeService.PAIEMENT_MARCHAND);
        expect(result.totalFees).toBeGreaterThan(0);
        expect(result.netAmount).toBeGreaterThan(10000); // Les frais s'ajoutent au montant
      });
    });

    describe('TRANSFERT_ARGENT type', () => {
      const transfertService = createMockService(TypeService.TRANSFERT_ARGENT, {
        type: 'POURCENTAGE',
        rate: 0.02,
        minimum: 50,
        maximum: 500,
      });

      it('should calculate transfer fees with min/max limits', () => {
        const params: SimulationParams = {
          institution: null,
          service: transfertService,
          amount: 1000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('totalFees');
        expect(result).toHaveProperty('netAmount');
        expect(result.serviceType).toBe(TypeService.TRANSFERT_ARGENT);
        expect(result.feeDescription).toContain('frais min 50');
        expect(result.feeDescription).toContain('frais max 500');
      });
    });

    describe('ASSURANCE type', () => {
      const assuranceService = createMockService(TypeService.ASSURANCE, {
        type: 'FIX',
        amount: 200,
        rate: 0.05,
      });

      it('should calculate insurance premium correctly', () => {
        const params: SimulationParams = {
          institution: null,
          service: assuranceService,
          amount: 100000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('annualPremium');
        expect(result).toHaveProperty('totalPremium');
        expect(result).toHaveProperty('serviceType');
        expect(result).toHaveProperty('feeDescription');
        expect(result.serviceType).toBe(TypeService.ASSURANCE);
        expect(result.annualPremium).toBeGreaterThan(0);
      });
    });

    describe('Service fees calculation', () => {
      it('should calculate percentage fees', () => {
        const service = createMockService(TypeService.CREDIT, {
          type: 'POURCENTAGE',
          rate: 0.02,
        });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 100000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result).toBeDefined();
        expect(result.feeDescription).toContain('2%');
      });

      it('should handle service with no plafonds', () => {
        const service = createMockService(TypeService.CREDIT, {
          type: 'POURCENTAGE',
          rate: 0.035,
        });
        // Supprimer les plafonds
        service.plafonds = [];

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 100000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result).toBeDefined();
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });

      it('should handle service with invalid plafond index', () => {
        const service = createMockService(TypeService.CREDIT, {
          type: 'POURCENTAGE',
          rate: 0.035,
        });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 100000,
          selectedPlafondIndex: 999, // Index invalide
        };

        const result = calculateEstimation(params);
        expect(result).toBeDefined();
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });

      it('should calculate fixed fees', () => {
        const service = createMockService(TypeService.EPARGNE, {
          type: 'FIX',
          amount: 500,
        });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 50000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result.finalAmount).toBeDefined();
        expect(result.feeDescription).toContain('500 F CFA');
      });

      it('should apply minimum fees', () => {
        const service = createMockService(TypeService.CREDIT, {
          type: 'POURCENTAGE',
          rate: 0.001,
          minimum: 100,
        });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 1000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result.monthlyPayment).toBeGreaterThan(0);
        expect(result.feeDescription).toContain('frais min 100');
      });

      it('should apply maximum fees', () => {
        const service = createMockService(TypeService.CREDIT, {
          type: 'POURCENTAGE',
          rate: 0.1,
          maximum: 500,
        });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 100000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result.monthlyPayment).toBeGreaterThan(0);
        expect(result.feeDescription).toContain('frais max 500');
      });

      it('should handle combined fixed and percentage fees', () => {
        const service = createMockService(TypeService.PAIEMENT_MARCHAND, {
          type: 'FIX',
          amount: 50,
          rate: 0.015,
        });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 10000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result.totalFees).toBeGreaterThan(0);
        expect(result.feeDescription).toContain('1.50%');
        expect(result.feeDescription).toContain('50');
      });

      it('should handle free services', () => {
        const service = createMockService(TypeService.DEPOT_SIMPLE, {
          type: 'FREE',
        });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 10000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result.totalFees).toBe(0);
        expect(result.feeDescription).toBe('Gratuit');
      });

      it('should use zero rate when no rate is defined in service fees', () => {
        const epargneService = createMockService(TypeService.EPARGNE, {
          type: 'FREE', // Pas de taux défini
        });

        const params: SimulationParams = {
          institution: null,
          service: epargneService,
          amount: 50000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result.annualRate).toBe(0); // Pas de taux = 0%
        expect(result.finalAmount).toBe(50000); // Montant final = montant initial (pas d'intérêt)
      });

      it('should use service rate when defined in fees', () => {
        const creditService = createMockService(TypeService.CREDIT, {
          type: 'POURCENTAGE',
          rate: 0.15, // 15%
        });

        const params: SimulationParams = {
          institution: null,
          service: creditService,
          amount: 100000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result.monthlyPayment).toBeGreaterThan(0);
        // Le taux utilisé pour le calcul sera 15% (0.15 * 100)
      });

      it('should handle credit without interest rate (capital only)', () => {
        const creditService = createMockService(TypeService.CREDIT, {
          type: 'FREE', // Pas de taux d'intérêt
        });

        const params: SimulationParams = {
          institution: null,
          service: creditService,
          amount: 120000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result.monthlyPayment).toBe(10000); // 120000 / 12 mois
        expect(result.totalInterest).toBe(0); // Pas d'intérêt
        expect(result.totalCost).toBe(120000); // Coût total = capital seulement
      });

      it('should handle DEPOT_SIMPLE service type', () => {
        const depotService = createMockService(TypeService.DEPOT_SIMPLE, {
          type: 'FREE',
        });

        const params: SimulationParams = {
          institution: null,
          service: depotService,
          amount: 50000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result.totalFees).toBe(0);
        expect(result.feeDescription).toBe('Gratuit');
        expect(result.serviceType).toBe(TypeService.DEPOT_SIMPLE);
      });

      it('should handle AUTRES service type', () => {
        const autresService = createMockService(TypeService.AUTRES, {
          type: 'POURCENTAGE',
          rate: 0.01,
        });

        const params: SimulationParams = {
          institution: null,
          service: autresService,
          amount: 100000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result).toBeDefined();
        expect(result.serviceType).toBe(TypeService.AUTRES);
        expect(result.feeDescription).toContain('1%');
      });

      it('should handle service with invalid plafond format', () => {
        const service = createMockService(TypeService.CREDIT, {
          type: 'POURCENTAGE',
          rate: 0.035,
        });
        service.plafonds = ['invalid-format', '1000-50000'];

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 100000,
          selectedPlafondIndex: 0,
        };

        const result = calculateEstimation(params);
        expect(result).toBeDefined();
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });
    });

    it('should handle service with empty plafonds array', () => {
      const service = createMockService(TypeService.CREDIT, {
        type: 'POURCENTAGE',
        rate: 0.035,
      });
      service.plafonds = [];

      const params: SimulationParams = {
        institution: null,
        service,
        amount: 100000,
        selectedPlafondIndex: 0,
      };

      const result = calculateEstimation(params);
      expect(result).toBeDefined();
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });

    it('should handle service with null plafonds', () => {
      const service = createMockService(TypeService.CREDIT, {
        type: 'POURCENTAGE',
        rate: 0.035,
      });
      service.plafonds = null as any;

      const params: SimulationParams = {
        institution: null,
        service,
        amount: 100000,
        selectedPlafondIndex: 0,
      };

      const result = calculateEstimation(params);
      expect(result).toBeDefined();
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });

    it('should handle service with undefined plafonds', () => {
      const service = createMockService(TypeService.CREDIT, {
        type: 'POURCENTAGE',
        rate: 0.035,
      });
      service.plafonds = undefined as any;

      const params: SimulationParams = {
        institution: null,
        service,
        amount: 100000,
        selectedPlafondIndex: 0,
      };

      const result = calculateEstimation(params);
      expect(result).toBeDefined();
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });

    it('should handle service with malformed plafond string', () => {
      const service = createMockService(TypeService.CREDIT, {
        type: 'POURCENTAGE',
        rate: 0.035,
      });
      service.plafonds = ['not-a-valid-range', '1000-50000'];

      const params: SimulationParams = {
        institution: null,
        service,
        amount: 100000,
        selectedPlafondIndex: 0,
      };

      const result = calculateEstimation(params);
      expect(result).toBeDefined();
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });

    it('should handle service with single value plafond', () => {
      const service = createMockService(TypeService.CREDIT, {
        type: 'POURCENTAGE',
        rate: 0.035,
      });
      service.plafonds = ['50000'];

      const params: SimulationParams = {
        institution: null,
        service,
        amount: 50000,
        selectedPlafondIndex: 0,
      };

      const result = calculateEstimation(params);
      expect(result).toBeDefined();
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });

    it('should handle service with negative amount', () => {
      const service = createMockService(TypeService.CREDIT, {
        type: 'POURCENTAGE',
        rate: 0.035,
      });

      const params: SimulationParams = {
        institution: null,
        service,
        amount: -1000,
        selectedPlafondIndex: 0,
      };

      const result = calculateEstimation(params);
      expect(result).toBeDefined();
      expect(result.serviceType).toBe('crédit');
      expect(result.monthlyPayment).toBeLessThan(0);
    });

    it('should handle service with zero amount', () => {
      const service = createMockService(TypeService.CREDIT, {
        type: 'POURCENTAGE',
        rate: 0.035,
      });

      const params: SimulationParams = {
        institution: null,
        service,
        amount: 0,
        selectedPlafondIndex: 0,
      };

      const result = calculateEstimation(params);
      expect(result).toBeDefined();
      expect(result.serviceType).toBe('crédit');
      expect(result.monthlyPayment).toBe(0);
    });

    it('should handle service with very large amount', () => {
      const service = createMockService(TypeService.CREDIT, {
        type: 'POURCENTAGE',
        rate: 0.035,
      });

      const params: SimulationParams = {
        institution: null,
        service,
        amount: 999999999,
        selectedPlafondIndex: 0,
      };

      const result = calculateEstimation(params);
      expect(result).toBeDefined();
      expect(result.monthlyPayment).toBeGreaterThan(0);
    });
  });
});
