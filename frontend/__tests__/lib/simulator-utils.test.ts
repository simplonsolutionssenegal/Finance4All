import type { SimulationParams, InstitutionProduct } from '@/lib/simulator-types';
import {
  calculateEstimation,
  formatCurrency,
  formatDuration,
  validateValue,
  calculateStep,
  generateInstitutions,
} from '@/lib/simulator-utils';

// Mock data pour les tests
const mockProduct: InstitutionProduct = {
  id: 'test-product',
  name: 'Test Product',
  description: 'Test Description',
  icon: '💰',
  type: 'CREDIT',
  rates: { min: 2.5, max: 4.0 },
  limits: { amount: { min: 1000, max: 100000 }, duration: { min: 1, max: 10 } },
};

const mockSimulationParams: SimulationParams = {
  institution: null,
  product: mockProduct,
  amount: 100000,
  duration: 10,
};

describe('simulator-utils', () => {
  describe('generateInstitutions', () => {
    it('should generate institutions array', () => {
      const institutions = generateInstitutions();

      expect(Array.isArray(institutions)).toBe(true);
      expect(institutions.length).toBeGreaterThan(0);
    });

    it('should generate institutions with correct structure', () => {
      const institutions = generateInstitutions();
      const institution = institutions[0];

      expect(institution).toHaveProperty('id');
      expect(institution).toHaveProperty('name');
      expect(institution).toHaveProperty('logo');
      expect(institution).toHaveProperty('products');
      expect(Array.isArray(institution.products)).toBe(true);
    });

    it('should generate institutions with products having correct structure', () => {
      const institutions = generateInstitutions();
      const institution = institutions[0];
      const product = institution.products[0];

      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('icon');
      expect(product).toHaveProperty('type');
      expect(product).toHaveProperty('rates');
      expect(product).toHaveProperty('limits');

      expect(product.rates).toHaveProperty('min');
      expect(product.rates).toHaveProperty('max');
      expect(product.limits).toHaveProperty('amount');
      expect(product.limits).toHaveProperty('duration');
      expect(product.limits.amount).toHaveProperty('min');
      expect(product.limits.amount).toHaveProperty('max');
      expect(product.limits.duration).toHaveProperty('min');
      expect(product.limits.duration).toHaveProperty('max');
    });

    it('should generate consistent results', () => {
      const institutions1 = generateInstitutions();
      const institutions2 = generateInstitutions();

      // Les institutions devraient être générées de manière déterministe
      expect(institutions1.length).toBe(institutions2.length);
      expect(institutions1[0].name).toBe(institutions2[0].name);
    });
  });

  describe('calculateEstimation', () => {
    it('should return default estimation when no product', () => {
      const params: SimulationParams = {
        institution: null,
        product: null,
        amount: 100000,
        duration: 10,
      };

      const result = calculateEstimation(params);

      expect(result).toEqual({ annualRate: 0 });
    });

    describe('CREDIT type', () => {
      it('should calculate credit estimation correctly', () => {
        const creditProduct: InstitutionProduct = {
          ...mockProduct,
          type: 'CREDIT',
          rates: { min: 3.0, max: 4.0 },
        };

        const params: SimulationParams = {
          ...mockSimulationParams,
          product: creditProduct,
          amount: 100000,
          duration: 10,
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('monthlyPayment');
        expect(result).toHaveProperty('totalInterest');
        expect(result).toHaveProperty('totalCost');
        expect(result).toHaveProperty('annualRate');
        expect(result.annualRate).toBe(3.5); // (3.0 + 4.0) / 2
        expect(typeof result.monthlyPayment).toBe('number');
        expect(typeof result.totalInterest).toBe('number');
        expect(typeof result.totalCost).toBe('number');
      });

      it('should calculate credit with different amounts and durations', () => {
        const creditProduct: InstitutionProduct = {
          ...mockProduct,
          type: 'CREDIT',
          rates: { min: 2.5, max: 3.5 },
        };

        const params1: SimulationParams = {
          ...mockSimulationParams,
          product: creditProduct,
          amount: 50000,
          duration: 5,
        };

        const params2: SimulationParams = {
          ...mockSimulationParams,
          product: creditProduct,
          amount: 200000,
          duration: 20,
        };

        const result1 = calculateEstimation(params1);
        const result2 = calculateEstimation(params2);

        expect(result1.monthlyPayment).toBeLessThan(result2.monthlyPayment || 0);
        expect(result1.totalInterest).toBeLessThan(result2.totalInterest || 0);
      });
    });

    describe('INVESTISSEMENT type', () => {
      it('should calculate investment estimation correctly', () => {
        const investmentProduct: InstitutionProduct = {
          ...mockProduct,
          type: 'INVESTISSEMENT',
          rates: { min: 4.0, max: 6.0 },
        };

        const params: SimulationParams = {
          ...mockSimulationParams,
          product: investmentProduct,
          amount: 10000,
          duration: 5,
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('finalAmount');
        expect(result).toHaveProperty('totalInterest');
        expect(result).toHaveProperty('annualRate');
        expect(result.annualRate).toBe(5.0); // (4.0 + 6.0) / 2
        expect(result.finalAmount).toBeGreaterThan(params.amount);
        expect(result.totalInterest).toBeGreaterThan(0);
      });
    });

    describe('EPARGNE type', () => {
      it('should calculate savings estimation correctly', () => {
        const savingsProduct: InstitutionProduct = {
          ...mockProduct,
          type: 'EPARGNE',
          rates: { min: 2.0, max: 3.0 },
        };

        const params: SimulationParams = {
          ...mockSimulationParams,
          product: savingsProduct,
          amount: 5000,
          duration: 3,
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('finalAmount');
        expect(result).toHaveProperty('totalInterest');
        expect(result).toHaveProperty('annualRate');
        expect(result.annualRate).toBe(2.5); // (2.0 + 3.0) / 2
        expect(result.finalAmount).toBeGreaterThan(params.amount);
        expect(result.totalInterest).toBeGreaterThan(0);
      });
    });

    describe('ASSURANCE type', () => {
      it('should calculate insurance estimation correctly', () => {
        const insuranceProduct: InstitutionProduct = {
          ...mockProduct,
          type: 'ASSURANCE',
          rates: { min: 1.0, max: 2.0 },
        };

        const params: SimulationParams = {
          ...mockSimulationParams,
          product: insuranceProduct,
          amount: 100000,
          duration: 10,
        };

        const result = calculateEstimation(params);

        expect(result).toHaveProperty('monthlyPayment');
        expect(result).toHaveProperty('totalInterest');
        expect(result).toHaveProperty('annualRate');
        expect(result.annualRate).toBe(1.5); // (1.0 + 2.0) / 2
        expect(typeof result.monthlyPayment).toBe('number');
        expect(typeof result.totalInterest).toBe('number');
      });
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toMatch(/1\s*000\s*F\s*CFA/);
      expect(formatCurrency(100000)).toMatch(/100\s*000\s*F\s*CFA/);
      expect(formatCurrency(1234.56)).toMatch(/1\s*235\s*F\s*CFA/);
    });

    it('should handle zero amount', () => {
      expect(formatCurrency(0)).toMatch(/0\s*F\s*CFA/);
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-1000)).toMatch(/-1\s*000\s*F\s*CFA/);
    });

    it('should handle decimal amounts', () => {
      expect(formatCurrency(123.45)).toMatch(/123\s*F\s*CFA/);
      expect(formatCurrency(0.99)).toMatch(/1\s*F\s*CFA/);
    });

    it('should handle large amounts', () => {
      expect(formatCurrency(1000000)).toMatch(/1\s*000\s*000\s*F\s*CFA/);
    });

    it('should use XOF currency format', () => {
      const result = formatCurrency(1000);
      expect(result).toMatch(/F\s*CFA/);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });
  });

  describe('formatDuration', () => {
    it('should format duration correctly for singular', () => {
      expect(formatDuration(1)).toBe('1 an');
    });

    it('should format duration correctly for plural', () => {
      expect(formatDuration(2)).toBe('2 ans');
      expect(formatDuration(10)).toBe('10 ans');
    });

    it('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0 an');
    });

    it('should handle decimal durations', () => {
      expect(formatDuration(1.5)).toBe('1.5 ans');
      expect(formatDuration(2.5)).toBe('2.5 ans');
    });
  });

  describe('validateValue', () => {
    it('should return value when within limits', () => {
      expect(validateValue(50, 0, 100)).toBe(50);
      expect(validateValue(0, 0, 100)).toBe(0);
      expect(validateValue(100, 0, 100)).toBe(100);
    });

    it('should clamp value to minimum when below limit', () => {
      expect(validateValue(-10, 0, 100)).toBe(0);
      expect(validateValue(5, 10, 100)).toBe(10);
    });

    it('should clamp value to maximum when above limit', () => {
      expect(validateValue(150, 0, 100)).toBe(100);
      expect(validateValue(95, 0, 90)).toBe(90);
    });

    it('should handle equal min and max', () => {
      expect(validateValue(50, 50, 50)).toBe(50);
      expect(validateValue(40, 50, 50)).toBe(50);
      expect(validateValue(60, 50, 50)).toBe(50);
    });

    it('should handle negative limits', () => {
      expect(validateValue(-5, -10, 10)).toBe(-5);
      expect(validateValue(-15, -10, 10)).toBe(-10);
      expect(validateValue(15, -10, 10)).toBe(10);
    });
  });

  describe('calculateStep', () => {
    it('should return 100 for amounts less than 10000', () => {
      expect(calculateStep(0)).toBe(100);
      expect(calculateStep(1000)).toBe(100);
      expect(calculateStep(9999)).toBe(100);
    });

    it('should return 1000 for amounts 10000 and above', () => {
      expect(calculateStep(10000)).toBe(1000);
      expect(calculateStep(50000)).toBe(1000);
      expect(calculateStep(100000)).toBe(1000);
    });

    it('should handle edge cases', () => {
      expect(calculateStep(-1000)).toBe(100);
      expect(calculateStep(9999.99)).toBe(100);
      expect(calculateStep(10000.01)).toBe(1000);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle extreme values in calculateEstimation', () => {
      const extremeProduct: InstitutionProduct = {
        ...mockProduct,
        type: 'CREDIT',
        rates: { min: 0.1, max: 0.1 },
      };

      const params: SimulationParams = {
        ...mockSimulationParams,
        product: extremeProduct,
        amount: 1,
        duration: 1,
      };

      expect(() => calculateEstimation(params)).not.toThrow();
    });

    it('should handle zero values in calculations', () => {
      const zeroProduct: InstitutionProduct = {
        ...mockProduct,
        type: 'CREDIT',
        rates: { min: 0, max: 0 },
      };

      const params: SimulationParams = {
        ...mockSimulationParams,
        product: zeroProduct,
        amount: 0,
        duration: 0,
      };

      const result = calculateEstimation(params);
      expect(result.annualRate).toBe(0);
    });

    it('should handle very large numbers', () => {
      expect(() => formatCurrency(Number.MAX_SAFE_INTEGER)).not.toThrow();
      expect(() => formatDuration(Number.MAX_SAFE_INTEGER)).not.toThrow();
    });

    it('should handle NaN and Infinity values gracefully', () => {
      expect(() => validateValue(NaN, 0, 100)).not.toThrow();
      expect(() => validateValue(Infinity, 0, 100)).not.toThrow();
      expect(() => validateValue(-Infinity, 0, 100)).not.toThrow();
    });
  });
});
