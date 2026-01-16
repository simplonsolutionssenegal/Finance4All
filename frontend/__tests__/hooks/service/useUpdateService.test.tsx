import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import type { CreateServiceDto } from '@/types/Service';
import { TypeService } from '@/types/Service';
import { useUpdateService } from '@/hooks/service/useUpdateService';

// Mocks
const mockGetToken = jest.fn();
const mockShowLoader = jest.fn();
const mockHideLoader = jest.fn();

jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(() => ({
    getToken: mockGetToken,
  })),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(),
}));

jest.mock('@/contexts/LoaderContext', () => ({
  useLoader: jest.fn(() => ({
    showLoader: mockShowLoader,
    hideLoader: mockHideLoader,
  })),
}));

describe('useUpdateService', () => {
  let queryClient: QueryClient;
  const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;
  const mockToast = toast as jest.Mocked<typeof toast>;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset des mocks
    jest.clearAllMocks();
    mockGetToken.mockResolvedValue('mock-token');
  });

  describe('Succès de la mutation', () => {
    it('met à jour un service avec succès', async () => {
      const mockResponse = {
        success: true,
        message: 'Service mis à jour',
        data: { id: 'service-1' },
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateService(), { wrapper });

      const serviceData: Partial<CreateServiceDto> = {
        name: 'Service Updated',
        type: TypeService.TRANSFERT_ARGENT,
      };

      result.current.updateService({
        institutionId: 'inst-1',
        serviceId: 'service-1',
        serviceData,
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockShowLoader).toHaveBeenCalledTimes(1);
      expect(mockGetToken).toHaveBeenCalledTimes(1);
      expect(mockApiClient).toHaveBeenCalledWith(
        'institutions/inst-1/services/service-1',
        'PUT',
        'mock-token',
        serviceData
      );
      expect(mockHideLoader).toHaveBeenCalledTimes(1);
      expect(mockToast.success).toHaveBeenCalledWith('Service modifié avec succès !');
    });

    it('appelle le callback onSuccess quand fourni', async () => {
      const mockResponse = {
        success: true,
        message: 'Service mis à jour',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const onSuccessMock = jest.fn();
      const { result } = renderHook(() => useUpdateService({ onSuccess: onSuccessMock }), {
        wrapper,
      });

      const serviceData: Partial<CreateServiceDto> = {
        name: 'Service Updated',
      };

      result.current.updateService({
        institutionId: 'inst-1',
        serviceId: 'service-1',
        serviceData,
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(onSuccessMock).toHaveBeenCalledTimes(1);
      expect(mockToast.success).toHaveBeenCalled();
    });
  });

  describe('Échec de la mutation', () => {
    it('gère une réponse avec success: false', async () => {
      const mockResponse = {
        success: false,
        message: 'Service non trouvé',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateService(), { wrapper });

      const serviceData: Partial<CreateServiceDto> = {
        name: 'Service Updated',
      };

      result.current.updateService({
        institutionId: 'inst-1',
        serviceId: 'service-1',
        serviceData,
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockShowLoader).toHaveBeenCalledTimes(1);
      expect(mockHideLoader).toHaveBeenCalledTimes(1);
      expect(mockToast.error).toHaveBeenCalledWith('La modification a échoué', {
        description: 'Service non trouvé',
      });
      expect(mockToast.success).not.toHaveBeenCalled();
    });

    it('gère une erreur réseau', async () => {
      const mockError = new Error('Network error');
      mockApiClient.mockRejectedValue(mockError);

      const { result } = renderHook(() => useUpdateService(), { wrapper });

      const serviceData: Partial<CreateServiceDto> = {
        name: 'Service Updated',
      };

      result.current.updateService({
        institutionId: 'inst-1',
        serviceId: 'service-1',
        serviceData,
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockShowLoader).toHaveBeenCalledTimes(1);
      expect(mockHideLoader).toHaveBeenCalledTimes(1);
      expect(mockToast.error).toHaveBeenCalledWith('La modification a échoué', {
        description: 'Network error',
      });
    });

    it("gère une erreur sans message d'erreur", async () => {
      const mockError = new Error();
      mockApiClient.mockRejectedValue(mockError);

      const { result } = renderHook(() => useUpdateService(), { wrapper });

      const serviceData: Partial<CreateServiceDto> = {
        name: 'Service Updated',
      };

      result.current.updateService({
        institutionId: 'inst-1',
        serviceId: 'service-1',
        serviceData,
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockToast.error).toHaveBeenCalledWith('La modification a échoué', {
        description: 'An unexpected error occurred.',
      });
    });

    it("n'appelle pas onSuccess en cas d'erreur", async () => {
      const mockError = new Error('Update failed');
      mockApiClient.mockRejectedValue(mockError);

      const onSuccessMock = jest.fn();
      const { result } = renderHook(() => useUpdateService({ onSuccess: onSuccessMock }), {
        wrapper,
      });

      const serviceData: Partial<CreateServiceDto> = {
        name: 'Service Updated',
      };

      result.current.updateService({
        institutionId: 'inst-1',
        serviceId: 'service-1',
        serviceData,
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(onSuccessMock).not.toHaveBeenCalled();
    });
  });

  describe('État de chargement', () => {
    it('indique isUpdating pendant la mutation', async () => {
      const mockResponse = {
        success: true,
      };

      mockApiClient.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockResponse), 100))
      );

      const { result } = renderHook(() => useUpdateService(), { wrapper });

      expect(result.current.isUpdating).toBe(false);

      result.current.updateService({
        institutionId: 'inst-1',
        serviceId: 'service-1',
        serviceData: { name: 'Test' },
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });
    });

    it('affiche et cache le loader correctement', async () => {
      const mockResponse = {
        success: true,
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateService(), { wrapper });

      result.current.updateService({
        institutionId: 'inst-1',
        serviceId: 'service-1',
        serviceData: { name: 'Test' },
      });

      await waitFor(() => {
        expect(mockShowLoader).toHaveBeenCalledTimes(1);
      });

      await waitFor(() => {
        expect(mockHideLoader).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Gestion du token', () => {
    it('utilise le token retourné par getToken', async () => {
      const customToken = 'custom-auth-token';
      mockGetToken.mockResolvedValue(customToken);

      const mockResponse = {
        success: true,
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateService(), { wrapper });

      result.current.updateService({
        institutionId: 'inst-1',
        serviceId: 'service-1',
        serviceData: { name: 'Test' },
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockApiClient).toHaveBeenCalledWith(
        'institutions/inst-1/services/service-1',
        'PUT',
        customToken,
        { name: 'Test' }
      );
    });

    it('gère le cas où getToken retourne null', async () => {
      mockGetToken.mockResolvedValue(null);

      const mockResponse = {
        success: true,
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateService(), { wrapper });

      result.current.updateService({
        institutionId: 'inst-1',
        serviceId: 'service-1',
        serviceData: { name: 'Test' },
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockApiClient).toHaveBeenCalledWith(
        'institutions/inst-1/services/service-1',
        'PUT',
        null,
        { name: 'Test' }
      );
    });
  });

  describe('Données partielles', () => {
    it('accepte des données partielles de service', async () => {
      const mockResponse = {
        success: true,
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateService(), { wrapper });

      const partialData: Partial<CreateServiceDto> = {
        name: 'Nouveau nom',
      };

      result.current.updateService({
        institutionId: 'inst-1',
        serviceId: 'service-1',
        serviceData: partialData,
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockApiClient).toHaveBeenCalledWith(
        'institutions/inst-1/services/service-1',
        'PUT',
        'mock-token',
        partialData
      );
    });

    it('accepte des données complètes de service', async () => {
      const mockResponse = {
        success: true,
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateService(), { wrapper });

      const completeData: CreateServiceDto = {
        name: 'Service complet',
        longName: 'Service complet description',
        type: TypeService.TRANSFERT_ARGENT,
        montantMin: 1000,
        montantMax: 50000,
        frais: {
          montantFixe: 100,
          pourcentage: 0.02,
        },
        conditionAccess: [],
        plafonds: [],
        infrastructureAccess: [],
      };

      result.current.updateService({
        institutionId: 'inst-1',
        serviceId: 'service-1',
        serviceData: completeData,
      });

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false);
      });

      expect(mockApiClient).toHaveBeenCalledWith(
        'institutions/inst-1/services/service-1',
        'PUT',
        'mock-token',
        completeData
      );
    });
  });
});
