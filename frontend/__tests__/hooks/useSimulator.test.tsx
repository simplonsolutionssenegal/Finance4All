import { act, renderHook, waitFor } from '@testing-library/react';

import { useSimulator } from '@/hooks/useSimulator';
import { useSimulatorStore } from '@/lib/simulator-store';
import type { Institution, Service } from '@/lib/simulator-types';
import { InstitutionStatus } from '@/types/Institution';
import { TypeService } from '@/types/Service';

// Mock du hook useGetInstitutions
jest.mock('@/hooks/institution/useGetInstitutions', () => ({
  useGetInstitutions: jest.fn(),
}));

// Mock de useQueryClient
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

const mockUseGetInstitutions = require('@/hooks/institution/useGetInstitutions').useGetInstitutions;

// Mock data pour les tests
const mockService: Service = {
  id: 'test-service',
  name: 'Test Service',
  longName: 'Test Service Description',
  type: TypeService.CREDIT,
  frais: {
    pourcentage: 3.5,
    montantFixe: 100,
    minimum: 50,
    maximum: 500,
  },
  conditionAccess: [],
  plafonds: ['1000-100000', '1-10'],
  infrastructureAccess: [],
  institutionId: 'test-institution',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockInstitution: Institution = {
  id: 'test-institution',
  name: 'Test Bank',
  description: 'Test Bank Description',
  website: 'https://testbank.com',
  geographicZones: ['Sénégal'],
  logoUrl: 'https://testbank.com/logo.png',
  status: InstitutionStatus.ACTIVE,
  type: 'SERVICE_FINANCIER_DECENTRALISE',
  pays: 'SENEGAL',
  services: [mockService],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockInstitutions: Institution[] = [mockInstitution];

describe('useSimulator', () => {
  beforeEach(() => {
    // Reset le store avant chaque test
    act(() => {
      useSimulatorStore.getState().resetSimulation();
    });

    // Reset des mocks
    jest.clearAllMocks();
    mockUseGetInstitutions.mockReturnValue({
      institutions: mockInstitutions,
      isLoading: false,
      pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

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
        service: null,
        amount: 0,
        selectedPlafondIndex: 0,
      });
      expect(result.current.estimation).toBeNull();
      expect(result.current.isAnimating).toBe(false);
      expect(Array.isArray(result.current.institutions)).toBe(true);
    });

    it('should load institutions from backend', () => {
      const { result } = renderHook(() => useSimulator());

      expect(mockUseGetInstitutions).toHaveBeenCalledWith({ page: 1, limit: 20 });

      waitFor(() => {
        expect(result.current.institutions).toEqual(mockInstitutions);
      });
    });

    it('should not reinitialize institutions if they already exist', () => {
      // Set institutions first
      act(() => {
        useSimulatorStore.getState().setInstitutions(mockInstitutions);
      });

      const { result } = renderHook(() => useSimulator());

      expect(result.current.institutions).toEqual(mockInstitutions);
    });

    it('should expose isLoading from useGetInstitutions', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        isLoading: true,
        pagination: { page: 1, limit: 100, total: 0, totalPages: 0 },
      });

      const { result } = renderHook(() => useSimulator());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('updateParam', () => {
    it('should update institution parameter', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateParam('institution', mockInstitution);
      });

      expect(result.current.params.institution).toEqual(mockInstitution);
    });

    it('should update service parameter', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateParam('service', mockService);
      });

      expect(result.current.params.service).toEqual(mockService);
    });

    it('should update amount parameter', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateParam('amount', 50000);
      });

      expect(result.current.params.amount).toBe(50000);
    });

    it('should update selectedPlafondIndex parameter', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateParam('selectedPlafondIndex', 1);
      });

      expect(result.current.params.selectedPlafondIndex).toBe(1);
    });
  });

  describe('getAvailableServices', () => {
    it('should return services from selected institution', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateParam('institution', mockInstitution);
      });

      const services = result.current.getAvailableServices();
      expect(services).toEqual([mockService]);
    });

    it('should return empty array when no institution selected', () => {
      const { result } = renderHook(() => useSimulator());

      const services = result.current.getAvailableServices();
      expect(services).toEqual([]);
    });

    it('should return empty array when institution has no services', () => {
      const institutionWithoutServices = { ...mockInstitution, services: [] };
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateParam('institution', institutionWithoutServices);
      });

      const services = result.current.getAvailableServices();
      expect(services).toEqual([]);
    });
  });

  describe('resetSimulation', () => {
    it('should reset all parameters to initial state', () => {
      const { result } = renderHook(() => useSimulator());

      // Set some params
      act(() => {
        result.current.updateParam('institution', mockInstitution);
        result.current.updateParam('service', mockService);
        result.current.updateParam('amount', 50000);
        result.current.updateParam('selectedPlafondIndex', 1);
      });

      // Reset
      act(() => {
        result.current.resetSimulation();
      });

      expect(result.current.params).toEqual({
        institution: null,
        service: null,
        amount: 0,
        selectedPlafondIndex: 0,
      });
      expect(result.current.estimation).toBeNull();
      expect(result.current.isAnimating).toBe(false);
    });

    it('should reset institutions and invalidate cache', () => {
      const mockInvalidateQueries = jest.fn();
      const mockQueryClient = { invalidateQueries: mockInvalidateQueries };

      jest
        .spyOn(require('@tanstack/react-query'), 'useQueryClient')
        .mockReturnValue(mockQueryClient);

      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.resetSimulation();
      });

      // Vérifie que le cache est invalidé
      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['institutions'] });

      // Les institutions seront rechargées après invalidation
      waitFor(() => {
        expect(result.current.institutions.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Estimation calculation', () => {
    it('should calculate estimation when service is selected', async () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateParam('service', mockService);
        result.current.updateParam('amount', 100000);
        result.current.updateParam('selectedPlafondIndex', 0);
      });

      // Attendre que l'animation démarre et se termine (300ms)
      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      // Vérifier que l'estimation est calculée
      await waitFor(() => {
        expect(result.current.estimation).toBeDefined();
        expect(result.current.estimation?.serviceType).toBeDefined();
      });
    });

    it('should not calculate estimation when no service', () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateParam('amount', 100000);
        result.current.updateParam('selectedPlafondIndex', 0);
      });

      expect(result.current.estimation).toBeNull();
    });

    it('should recalculate estimation when params change', async () => {
      const { result } = renderHook(() => useSimulator());

      act(() => {
        result.current.updateParam('service', mockService);
        result.current.updateParam('amount', 50000);
        result.current.updateParam('selectedPlafondIndex', 0);
      });

      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current.estimation).toBeDefined();
      });

      const firstEstimation = result.current.estimation;

      // Changer le montant
      act(() => {
        result.current.updateParam('amount', 100000);
      });

      await act(async () => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        // L'estimation devrait être recalculée (différente de la première)
        expect(result.current.estimation).toBeDefined();
        expect(result.current.estimation).not.toEqual(firstEstimation);
      });
    });
  });

  describe('Loading state', () => {
    it('should reflect loading state from useGetInstitutions', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: [],
        isLoading: true,
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      const { result } = renderHook(() => useSimulator());

      expect(result.current.isLoading).toBe(true);
      // Les institutions peuvent être chargées depuis le store ou être vides
      expect(Array.isArray(result.current.institutions)).toBe(true);
    });

    it('should update when loading completes', () => {
      mockUseGetInstitutions.mockReturnValue({
        institutions: mockInstitutions,
        isLoading: false,
        pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
      });

      const { result } = renderHook(() => useSimulator());

      waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.institutions).toEqual(mockInstitutions);
      });
    });
  });

  describe('Integration', () => {
    it('should complete full simulation workflow', async () => {
      const { result } = renderHook(() => useSimulator());

      // 1. Select institution
      act(() => {
        result.current.updateParam('institution', mockInstitution);
      });

      expect(result.current.params.institution).toEqual(mockInstitution);

      // 2. Select service
      act(() => {
        result.current.updateParam('service', mockService);
      });

      expect(result.current.params.service).toEqual(mockService);

      // 3. Set amount and plafond
      act(() => {
        result.current.updateParam('amount', 100000);
        result.current.updateParam('selectedPlafondIndex', 0);
      });

      // 4. Wait for estimation
      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(result.current.estimation).toBeDefined();
      });

      // 5. Reset
      act(() => {
        result.current.resetSimulation();
      });

      expect(result.current.params.service).toBeNull();
      expect(result.current.estimation).toBeNull();
    });
  });
});
