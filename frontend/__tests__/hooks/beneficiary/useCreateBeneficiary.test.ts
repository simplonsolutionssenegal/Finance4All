import { useAuth } from '@clerk/nextjs';
import { renderHook } from '@testing-library/react';

import { useCreateBeneficiary } from '@/hooks/beneficiary/useCreateBeneficiary';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
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

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useCreateBeneficiary', () => {
  const mockGetToken = jest.fn();
  const mockMutateAsync = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      getToken: mockGetToken,
    } as any);

    const { useMutation } = require('@tanstack/react-query');
    useMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      onSuccess: mockOnSuccess,
      onError: mockOnError,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hook initialization', () => {
    it('should initialize correctly', () => {
      const { result } = renderHook(() => useCreateBeneficiary());

      expect(result.current).toBeDefined();
      expect(mockUseAuth).toHaveBeenCalled();
    });

    it('should return mutation object', () => {
      const { result } = renderHook(() => useCreateBeneficiary());

      expect(result.current).toHaveProperty('mutateAsync');
    });
  });

  describe('mutation configuration', () => {
    it('should configure mutation with correct parameters', () => {
      renderHook(() => useCreateBeneficiary());

      const { useMutation } = require('@tanstack/react-query');
      expect(useMutation).toHaveBeenCalledWith({
        mutationFn: expect.any(Function),
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      });
    });

    it('should call getToken when mutation function is executed', async () => {
      const mockToken = 'mock-token';
      mockGetToken.mockResolvedValue(mockToken);

      const { result } = renderHook(() => useCreateBeneficiary());

      const beneficiaryData = {
        clerkUserId: 'clerk_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+221771234567',
      };

      await result.current.mutateAsync(beneficiaryData);

      expect(mockGetToken).toHaveBeenCalled();
    });
  });

  describe('success handling', () => {
    it('should handle successful creation', () => {
      const { toast } = require('sonner');
      const { useMutation } = require('@tanstack/react-query');

      renderHook(() => useCreateBeneficiary());

      // Get the onSuccess callback
      const mutationConfig = useMutation.mock.calls[0][0];
      const onSuccess = mutationConfig.onSuccess;

      const mockResponse = {
        success: true,
        data: {
          id: 'clerk_123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+221771234567',
          role: 'beneficiary',
        },
        message: 'Bénéficiaire créé avec succès',
      };

      onSuccess(mockResponse);

      expect(toast.success).toHaveBeenCalledWith('Bénéficiaire créé avec succès', {
        description: mockResponse.message,
      });
    });
  });

  describe('error handling', () => {
    it('should handle creation errors', () => {
      const { toast } = require('sonner');
      const { useMutation } = require('@tanstack/react-query');

      renderHook(() => useCreateBeneficiary());

      // Get the onError callback
      const mutationConfig = useMutation.mock.calls[0][0];
      const onError = mutationConfig.onError;

      const mockError = new Error('Network error');
      onError(mockError);

      expect(toast.error).toHaveBeenCalledWith('Échec de la création du bénéficiaire', {
        description: mockError.message,
      });
    });
  });

  describe('api client integration', () => {
    it('should call apiClient with correct parameters', async () => {
      const { apiClient } = require('@/lib/api-client');
      const mockToken = 'mock-token';
      mockGetToken.mockResolvedValue(mockToken);

      const { result } = renderHook(() => useCreateBeneficiary());

      const beneficiaryData = {
        clerkUserId: 'clerk_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+221771234567',
      };

      await result.current.mutateAsync(beneficiaryData);

      expect(apiClient).toHaveBeenCalledWith(
        'api/v1/beneficiaries',
        'POST',
        mockToken,
        beneficiaryData
      );
    });
  });

  describe('query client integration', () => {
    it('should invalidate queries on success', () => {
      const { useQueryClient } = require('@tanstack/react-query');
      const mockInvalidateQueries = jest.fn();
      useQueryClient.mockReturnValue({
        invalidateQueries: mockInvalidateQueries,
      });

      const { useMutation } = require('@tanstack/react-query');
      renderHook(() => useCreateBeneficiary());

      // Get the onSuccess callback
      const mutationConfig = useMutation.mock.calls[0][0];
      const onSuccess = mutationConfig.onSuccess;

      const mockResponse = {
        success: true,
        data: {},
        message: 'Success',
      };

      onSuccess(mockResponse);

      expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['beneficiaries'] });
    });
  });
});
