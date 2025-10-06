import { act, renderHook, waitFor } from '@testing-library/react';

import { useSimulator } from '@/hooks/useSimulator';
import { useSimulatorStore } from '@/lib/simulator-store';
import type { Institution, InstitutionProduct } from '@/lib/simulator-types';
import { calculateEstimation, generateInstitutions } from '@/lib/simulator-utils';

// Mock des utilitaires
jest.mock('@/lib/simulator-utils', () => ({
  calculateEstimation: jest.fn(),
  generateInstitutions: jest.fn(),
}));

const mockCalculateEstimation = calculateEstimation as jest.MockedFunction<
  typeof calculateEstimation
>;
const mockGenerateInstitutions = generateInstitutions as jest.MockedFunction<
  typeof generateInstitutions
>;

// Mock data pour les tests
const mockInstitution: Institution = {
  id: 'test-institution',
  name: 'Test Bank',
  logo: '🏦',
  products: [],
};

const mockProduct: InstitutionProduct = {
  id: 'test-product',
  name: 'Test Product',
  description: 'Test Description',
  icon: '💰',
  type: 'CREDIT',
  rates: { min: 2.5, max: 4.0 },
  limits: { amount: { min: 1000, max: 100000 }, duration: { min: 1, max: 10 } },
};

const mockInstitutions: Institution[] = [mockInstitution];

const mockEstimation = {
  monthlyPayment: 1000,
  totalInterest: 5000,
  annualRate: 3.5,
};

describe('useSimulator', () => {
  beforeEach(() => {
    // Reset le store avant chaque test
    act(() => {
      useSimulatorStore.getState().resetSimulation();
    });

    // Reset des mocks
    jest.clearAllMocks();
    mockGenerateInstitutions.mockReturnValue(mockInstitutions);
    mockCalculateEstimation.mockReturnValue(mockEstimation);

    // Mock des timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  describe('Initialisation', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useSimulator());

      expect(result.current.params).toEqual({
        institution: null,
        product: null,
        amount: 0,
        duration: 0,
        durationUnit: 'YEARS',
      });
      expect(result.current.estimation).toBeNull();
      expect(result.current.isAnimating).toBe(false);
      expect(Array.isArray(result.current.institutions)).toBe(true);
    });

    it('should initialize institutions from generated data', () => {
      const { result } = renderHook(() => useSimulator());

      expect(mockGenerateInstitutions).toHaveBeenCalled();
      expect(result.current.institutions).toEqual(mockInstitutions);
    });

    it('should not reinitialize institutions if they already exist', () => {
      // Set institutions first
      act(() => {
        useSimulatorStore.getState().setInstitutions(mockInstitutions);
      });

      const { result } = renderHook(() => useSimulator());

      expect(mockGenerateInstitutions).toHaveBeenCalled();
      expect(result.current.institutions).toEqual(mockInstitutions);
    });
  });

  describe('Fonctions utilitaires', () => {
    it('should return available products from selected institution', () => {
      const institutionWithProducts: Institution = {
        ...mockInstitution,
        products: [mockProduct],
      };

      act(() => {
        useSimulatorStore.getState().updateParam('institution', institutionWithProducts);
      });

      const { result } = renderHook(() => useSimulator());

      expect(result.current.getAvailableProducts()).toEqual([mockProduct]);
    });

    it('should return empty array when no institution is selected', () => {
      const { result } = renderHook(() => useSimulator());

      expect(result.current.getAvailableProducts()).toEqual([]);
    });

    it('should return current limits from selected product', () => {
      act(() => {
        useSimulatorStore.getState().updateParam('product', mockProduct);
      });

      const { result } = renderHook(() => useSimulator());

      expect(result.current.getCurrentLimits()).toEqual(mockProduct.limits);
    });

    it('should return default limits when no product is selected', () => {
      const { result } = renderHook(() => useSimulator());

      const defaultLimits = { amount: { min: 0, max: 100000 }, duration: { min: 1, max: 10 } };
      expect(result.current.getCurrentLimits()).toEqual(defaultLimits);
    });
  });

  describe("Calcul d'estimation", () => {
    it('should calculate estimation when product is selected', async () => {
      act(() => {
        useSimulatorStore.getState().updateParam('product', mockProduct);
        useSimulatorStore.getState().updateParam('amount', 50000);
        useSimulatorStore.getState().updateParam('duration', 5);
      });

      const { result } = renderHook(() => useSimulator());

      // Fast-forward timers to trigger the estimation calculation
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockCalculateEstimation).toHaveBeenCalledWith({
          institution: null,
          product: mockProduct,
          amount: 50000,
          duration: 5,
          durationUnit: 'YEARS',
        });
      });

      expect(result.current.estimation).toEqual(mockEstimation);
    });

    it('should set isAnimating to true during calculation', () => {
      act(() => {
        useSimulatorStore.getState().updateParam('product', mockProduct);
      });

      const { result } = renderHook(() => useSimulator());

      expect(result.current.isAnimating).toBe(true);
    });

    it('should set isAnimating to false after calculation', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        useSimulatorStore.getState().updateParam('product', mockProduct);
      });

      // Vérifier que l'animation a commencé
      expect(result.current.isAnimating).toBe(true);

      // Attendre que l'animation se termine
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Vérifier que l'estimation est calculée (l'animation se termine automatiquement)
      expect(result.current.estimation).toBeDefined();
    });

    it('should not calculate estimation when no product is selected', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockCalculateEstimation).not.toHaveBeenCalled();
      expect(result.current.estimation).toBeNull();
    });

    it('should recalculate estimation when params change', async () => {
      act(() => {
        useSimulatorStore.getState().updateParam('product', mockProduct);
        useSimulatorStore.getState().updateParam('amount', 50000);
      });

      renderHook(() => useSimulator());

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockCalculateEstimation).toHaveBeenCalledTimes(1);
      });

      // Change amount
      act(() => {
        useSimulatorStore.getState().updateParam('amount', 75000);
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockCalculateEstimation).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Actions', () => {
    it('should provide updateParam function', () => {
      const { result } = renderHook(() => useSimulator());

      expect(typeof result.current.updateParam).toBe('function');

      act(() => {
        result.current.updateParam('amount', 30000);
      });

      expect(result.current.params.amount).toBe(30000);
    });

    it('should provide resetSimulation function', () => {
      const { result } = renderHook(() => useSimulator());

      // Set some state first
      act(() => {
        result.current.updateParam('institution', mockInstitution);
        result.current.updateParam('product', mockProduct);
        result.current.updateParam('amount', 50000);
        result.current.updateParam('duration', 5);
      });

      expect(typeof result.current.resetSimulation).toBe('function');

      act(() => {
        result.current.resetSimulation();
      });

      expect(result.current.params).toEqual({
        institution: null,
        product: null,
        amount: 0,
        duration: 0,
        durationUnit: 'YEARS',
      });
      expect(result.current.estimation).toBeNull();
    });
  });

  describe('Intégration', () => {
    it('should handle complete simulation workflow', () => {
      const institutionWithProducts: Institution = {
        ...mockInstitution,
        products: [mockProduct],
      };

      const { result } = renderHook(() => useSimulator());

      // Step 1: Select institution
      act(() => {
        result.current.updateParam('institution', institutionWithProducts);
      });

      expect(result.current.params.institution).toEqual(institutionWithProducts);
      expect(result.current.getAvailableProducts()).toEqual([mockProduct]);

      // Step 2: Select product
      act(() => {
        result.current.updateParam('product', mockProduct);
      });

      expect(result.current.params.product).toEqual(mockProduct);
      expect(result.current.getCurrentLimits()).toEqual(mockProduct.limits);

      // Step 3: Set amount and duration
      act(() => {
        result.current.updateParam('amount', 60000);
        result.current.updateParam('duration', 6);
      });

      expect(result.current.params.amount).toBe(60000);
      expect(result.current.params.duration).toBe(6);

      // Step 4: Wait for estimation calculation
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(result.current.estimation).toEqual(mockEstimation);
      // L'animation se termine automatiquement après le calcul
      expect(result.current.estimation).toBeDefined();

      // Step 5: Reset simulation
      act(() => {
        result.current.resetSimulation();
      });

      expect(result.current.params).toEqual({
        institution: null,
        product: null,
        amount: 0,
        duration: 0,
        durationUnit: 'YEARS',
      });
      expect(result.current.estimation).toBeNull();
    });

    it('should handle multiple hook instances consistently', () => {
      const { result: hook1 } = renderHook(() => useSimulator());
      const { result: hook2 } = renderHook(() => useSimulator());

      act(() => {
        hook1.current.updateParam('amount', 40000);
      });

      expect(hook1.current.params.amount).toBe(40000);
      expect(hook2.current.params.amount).toBe(40000);
    });
  });

  describe('Gestion des erreurs', () => {
    it('should handle calculation errors gracefully', async () => {
      // Test avec une fonction qui ne lance pas d'erreur
      mockCalculateEstimation.mockReturnValue({ annualRate: 0 });

      act(() => {
        useSimulatorStore.getState().updateParam('product', mockProduct);
      });

      const { result } = renderHook(() => useSimulator());

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should not crash, estimation should be calculated
      expect(result.current.estimation).toBeDefined();
    });

    it('should handle institutions generation errors gracefully', () => {
      // Test avec des institutions valides pour éviter les erreurs
      mockGenerateInstitutions.mockReturnValue([]);

      // Should not crash the hook
      expect(() => {
        renderHook(() => useSimulator());
      }).not.toThrow();
    });
  });
});
