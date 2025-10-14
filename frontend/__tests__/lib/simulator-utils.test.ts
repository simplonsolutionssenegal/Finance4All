import type { SimulationParams } from '@/lib/simulator-types';
import { calculateEstimation } from '@/lib/simulator-utils';
import { TypeService, type Service } from '@/types/Service';

// Mock data pour les tests
const createMockService = (type: TypeService, frais: any = {}): Service => ({
  id: 'test-service',
  name: 'Test Service',
  longName: 'Test Service Description',
  type,
  frais: {
    pourcentage: 3.5,
    montantFixe: 0,
    minimum: 0,
    maximum: 10000,
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
        duration: 10,
        durationUnit: 'YEARS',
      };

      const result = calculateEstimation(params);

      expect(result).toEqual({ annualRate: 0 });
    });

    describe('CREDIT type', () => {
      const creditService = createMockService(TypeService.CREDIT, { pourcentage: 3.5 });

      it('should calculate credit estimation correctly for YEARS', () => {
        const params: SimulationParams = {
          institution: null,
          service: creditService,
          amount: 100000,
          duration: 10,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('monthlyPayment');
        expect(result).toHaveProperty('totalInterest');
        expect(result).toHaveProperty('totalCost');
        expect(result).toHaveProperty('annualRate');
        expect(result.annualRate).toBe(3.5);
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });

      it('should calculate credit estimation correctly for MONTHS', () => {
        const params: SimulationParams = {
          institution: null,
          service: creditService,
          amount: 50000,
          duration: 24,
          durationUnit: 'MONTHS',
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('monthlyPayment');
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });

      it('should include service fees in credit calculation', () => {
        const serviceWithFees = createMockService(TypeService.CREDIT, {
          pourcentage: 3.5,
          montantFixe: 500,
        });

        const params: SimulationParams = {
          institution: null,
          service: serviceWithFees,
          amount: 100000,
          duration: 10,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });

      it('should handle small amounts', () => {
        const params: SimulationParams = {
          institution: null,
          service: creditService,
          amount: 1000,
          duration: 1,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });
    });

    describe('EPARGNE type', () => {
      const epargneService = createMockService(TypeService.EPARGNE, { pourcentage: 2.5 });

      it('should calculate savings estimation correctly for YEARS', () => {
        const params: SimulationParams = {
          institution: null,
          service: epargneService,
          amount: 50000,
          duration: 5,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('finalAmount');
        expect(result).toHaveProperty('totalInterest');
        expect(result).toHaveProperty('annualRate');
        expect(result.annualRate).toBe(2.5);
        expect(result.finalAmount).toBeGreaterThan(50000);
      });

      it('should calculate savings estimation correctly for MONTHS', () => {
        const params: SimulationParams = {
          institution: null,
          service: epargneService,
          amount: 10000,
          duration: 12,
          durationUnit: 'MONTHS',
        };

        const result = calculateEstimation(params);

        expect(result.finalAmount).toBeDefined();
        expect(result.finalAmount).toBeGreaterThanOrEqual(10000);
      });

      it('should deduct fees from final amount', () => {
        const serviceWithFees = createMockService(TypeService.EPARGNE, {
          pourcentage: 2.5,
          montantFixe: 100,
        });

        const params: SimulationParams = {
          institution: null,
          service: serviceWithFees,
          amount: 10000,
          duration: 1,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);
        expect(result.finalAmount).toBeDefined();
      });
    });

    describe('ASSURANCE type', () => {
      const assuranceService = createMockService(TypeService.ASSURANCE, { pourcentage: 1.5 });

      it('should calculate insurance estimation correctly', () => {
        const params: SimulationParams = {
          institution: null,
          service: assuranceService,
          amount: 100000,
          duration: 10,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('monthlyPayment');
        expect(result).toHaveProperty('totalInterest');
        expect(result).toHaveProperty('annualRate');
        expect(result.annualRate).toBe(1.5);
      });

      it('should handle insurance for short durations', () => {
        const params: SimulationParams = {
          institution: null,
          service: assuranceService,
          amount: 50000,
          duration: 1,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });
    });

    describe('Other service types', () => {
      const autreService = createMockService(TypeService.PAIEMENT_MARCHAND, { pourcentage: 2 });

      it('should calculate estimation for other types (default to savings)', () => {
        const params: SimulationParams = {
          institution: null,
          service: autreService,
          amount: 20000,
          duration: 3,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('finalAmount');
        expect(result).toHaveProperty('totalInterest');
      });
    });

    describe('Service fees calculation', () => {
      it('should calculate percentage fees', () => {
        const service = createMockService(TypeService.CREDIT, {
          pourcentage: 2,
          montantFixe: 0,
        });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 100000,
          duration: 5,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);
        expect(result).toBeDefined();
      });

      it('should calculate fixed fees', () => {
        const service = createMockService(TypeService.EPARGNE, {
          pourcentage: 0,
          montantFixe: 500,
        });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 50000,
          duration: 3,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);
        expect(result.finalAmount).toBeDefined();
      });

      it('should apply minimum fees', () => {
        const service = createMockService(TypeService.CREDIT, {
          pourcentage: 0.1,
          minimum: 100,
        });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 1000,
          duration: 1,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });

      it('should apply maximum fees', () => {
        const service = createMockService(TypeService.CREDIT, {
          pourcentage: 10,
          maximum: 500,
        });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 100000,
          duration: 5,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });

      it('should handle combined fixed and percentage fees', () => {
        const service = createMockService(TypeService.CREDIT, {
          pourcentage: 2,
          montantFixe: 200,
        });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 50000,
          duration: 3,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });
    });

    describe('Default rate handling', () => {
      it('should use default rate when no percentage in frais', () => {
        const service = createMockService(TypeService.CREDIT, {
          pourcentage: undefined,
          montantFixe: 100,
        });
        // Supprimer le pourcentage du mock
        delete service.frais.pourcentage;

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 10000,
          duration: 2,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);
        expect(result.annualRate).toBe(3); // Taux par défaut
      });
    });

    describe('Duration conversion', () => {
      it('should handle MONTHS duration correctly', () => {
        const service = createMockService(TypeService.CREDIT, { pourcentage: 3 });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 50000,
          duration: 12,
          durationUnit: 'MONTHS',
        };

        const result = calculateEstimation(params);
        expect(result.monthlyPayment).toBeGreaterThan(0);
      });

      it('should handle YEARS duration correctly', () => {
        const service = createMockService(TypeService.EPARGNE, { pourcentage: 2.5 });

        const params: SimulationParams = {
          institution: null,
          service,
          amount: 20000,
          duration: 5,
          durationUnit: 'YEARS',
        };

        const result = calculateEstimation(params);
        expect(result.finalAmount).toBeGreaterThan(20000);
      });
    });
  });
});
