import { useAuth } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { act, type ReactNode } from 'react';

import type { CreateBeneficiaryPayload } from '@/components/beneficiaire/AddBeneficiaryModal';
import { useCreateBeneficiaryAdmin } from '@/hooks/beneficiary/useCreateBeneficiaryAdmin';
import { apiClient } from '@/lib/api-client';

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

// Mock apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockApiClient = apiClient as jest.Mock;

describe('useCreateBeneficiaryAdmin', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    jest.clearAllMocks();

    // Default mock for useAuth
    mockUseAuth.mockReturnValue({
      getToken: jest.fn().mockResolvedValue('mock-token'),
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Successful creation', () => {
    it('should create beneficiary with valid payload', async () => {
      const mockResponse = {
        success: true,
        message: 'Bénéficiaire créé avec succès',
        data: { id: 'ben_123' },
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+221771234567',
        role: 'org:recipient',
        generateTempPassword: true,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient).toHaveBeenCalledWith('beneficiaries', 'POST', 'mock-token', payload);
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should call getToken before API request', async () => {
      const mockGetToken = jest.fn().mockResolvedValue('test-token');
      mockUseAuth.mockReturnValue({
        getToken: mockGetToken,
      });

      mockApiClient.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(mockGetToken).toHaveBeenCalled();
      });

      expect(mockApiClient).toHaveBeenCalledWith('beneficiaries', 'POST', 'test-token', payload);
    });

    it('should return temp password when generated', async () => {
      const mockResponse = {
        success: true,
        message: 'Bénéficiaire créé',
        data: { id: 'ben_123' },
        tempPassword: 'TempPass123!',
      };

      mockApiClient.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        role: 'org:recipient',
        generateTempPassword: true,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.tempPassword).toBe('TempPass123!');
    });

    it('should create beneficiary without phone', async () => {
      mockApiClient.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient).toHaveBeenCalledWith('beneficiaries', 'POST', 'mock-token', payload);
    });

    it('should handle payload with generateTempPassword false', async () => {
      mockApiClient.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.tempPassword).toBeUndefined();
    });
  });

  describe('Authentication errors', () => {
    it('should throw error when no token is available', async () => {
      mockUseAuth.mockReturnValue({
        getToken: jest.fn().mockResolvedValue(null),
      });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Unauthenticated'));
      expect(mockApiClient).not.toHaveBeenCalled();
    });

    it('should throw error when token is undefined', async () => {
      mockUseAuth.mockReturnValue({
        getToken: jest.fn().mockResolvedValue(undefined),
      });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Unauthenticated'));
    });

    it('should throw error when getToken rejects', async () => {
      mockUseAuth.mockReturnValue({
        getToken: jest.fn().mockRejectedValue(new Error('Token error')),
      });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Token error'));
    });
  });

  describe('API errors', () => {
    it('should handle API error with success false', async () => {
      mockApiClient.mockResolvedValue({
        success: false,
        message: 'Email déjà utilisé',
      });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Email déjà utilisé'));
    });

    it('should handle API error without message', async () => {
      mockApiClient.mockResolvedValue({
        success: false,
      });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Erreur lors de la création du bénéficiaire'));
    });

    it('should handle network error', async () => {
      mockApiClient.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Network error'));
    });

    it('should handle null response', async () => {
      mockApiClient.mockResolvedValue(null);

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Erreur lors de la création du bénéficiaire'));
    });

    it('should handle undefined response', async () => {
      mockApiClient.mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(new Error('Erreur lors de la création du bénéficiaire'));
    });
  });

  describe('Query invalidation', () => {
    it('should invalidate beneficiaries query on success', async () => {
      mockApiClient.mockResolvedValue({ success: true });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      const refetchSpy = jest.spyOn(queryClient, 'refetchQueries');

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['beneficiaries'] });
      expect(refetchSpy).toHaveBeenCalledWith({ queryKey: ['beneficiaries'] });
    });

    it('should not invalidate queries on error', async () => {
      mockApiClient.mockResolvedValue({ success: false, message: 'Error' });

      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
      const refetchSpy = jest.spyOn(queryClient, 'refetchQueries');

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(invalidateSpy).not.toHaveBeenCalled();
      expect(refetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('Mutation states', () => {
    it('should have correct initial states', () => {
      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isIdle).toBe(true);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });

    it('should transition to pending state', async () => {
      mockApiClient.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      expect(result.current.isIdle).toBe(false);
    });

    it('should transition to success state', async () => {
      mockApiClient.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should transition to error state', async () => {
      mockApiClient.mockResolvedValue({ success: false, message: 'Error' });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
    });

    it('should reset state when mutating again', async () => {
      mockApiClient.mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Reset and mutate again
      mockApiClient.mockResolvedValueOnce({ success: true });

      act(() => {
        result.current.mutate(payload);
      });

      // Check that mutation is triggered (state should be pending or success after completion)
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('MutateAsync', () => {
    it('should work with mutateAsync', async () => {
      mockApiClient.mockResolvedValue({
        success: true,
        data: { id: 'ben_123' },
      });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      const response = await result.current.mutateAsync(payload);

      expect(response).toEqual({
        success: true,
        data: { id: 'ben_123' },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should throw error with mutateAsync on failure', async () => {
      mockApiClient.mockResolvedValue({
        success: false,
        message: 'Creation failed',
      });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      await expect(result.current.mutateAsync(payload)).rejects.toEqual(
        new Error('Creation failed')
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple rapid mutations', async () => {
      mockApiClient.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload1: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john1@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      const payload2: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload1);
      result.current.mutate(payload2);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should have called apiClient twice
      expect(mockApiClient).toHaveBeenCalledTimes(2);
    });

    it('should handle special characters in payload', async () => {
      mockApiClient.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: "O'Neill",
        lastName: 'François-René',
        email: 'test+alias@example.com',
        phone: '+221 77 123 45 67',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient).toHaveBeenCalledWith('beneficiaries', 'POST', 'mock-token', payload);
    });

    it('should handle very long strings', async () => {
      mockApiClient.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'A'.repeat(100),
        lastName: 'B'.repeat(100),
        email: 'test@example.com',
        role: 'org:recipient',
        generateTempPassword: false,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should preserve all payload fields', async () => {
      mockApiClient.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+221771234567',
        role: 'org:recipient',
        generateTempPassword: true,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockApiClient).toHaveBeenCalledWith(
        'beneficiaries',
        'POST',
        'mock-token',
        expect.objectContaining({
          organizationId: 'org_123',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+221771234567',
          role: 'org:recipient',
          generateTempPassword: true,
        })
      );
    });
  });

  describe('TypeScript types', () => {
    it('should return correctly typed mutation result', async () => {
      mockApiClient.mockResolvedValue({
        success: true,
        message: 'Success',
        data: { id: 'ben_123' },
        tempPassword: 'Pass123!',
      });

      const { result } = renderHook(() => useCreateBeneficiaryAdmin(), {
        wrapper: createWrapper(),
      });

      const payload: CreateBeneficiaryPayload = {
        organizationId: 'org_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'org:recipient',
        generateTempPassword: true,
      };

      result.current.mutate(payload);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Type checks
      expect(result.current.data?.success).toBe(true);
      expect(result.current.data?.message).toBe('Success');
      expect(result.current.data?.data).toEqual({ id: 'ben_123' });
      expect(result.current.data?.tempPassword).toBe('Pass123!');
    });
  });
});
