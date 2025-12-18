import { useAuth, useOrganization } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

import { useBeneficiaries } from '@/hooks/beneficiary/useBeneficiaries';
import { BeneficiaryStatus } from '@/types/beneficiaire/beneficiary';

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
  useOrganization: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseOrganization = useOrganization as jest.Mock;

// Mock fetch
global.fetch = jest.fn();

describe('useBeneficiaries', () => {
  let queryClient: QueryClient;

  const mockBeneficiaries = [
    {
      id: 'uuid-1',
      clerkUserId: 'user_123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+221771234567',
      status: BeneficiaryStatus.ACTIVE,
      progressPercent: 75,
      createdAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'uuid-2',
      clerkUserId: 'user_456',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+221779876543',
      status: BeneficiaryStatus.INACTIVE,
      progressPercent: 50,
      createdAt: '2024-02-20T14:30:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Default mocks
    mockUseAuth.mockReturnValue({
      getToken: jest.fn().mockResolvedValue('mock-token'),
    });

    mockUseOrganization.mockReturnValue({
      organization: { id: 'org_123', name: 'Test Org' },
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        success: true,
        data: mockBeneficiaries,
      }),
      text: jest.fn().mockResolvedValue(''),
    });

    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('Successful data fetching', () => {
    it('should fetch beneficiaries successfully', async () => {
      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      // Initial state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeNull();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockBeneficiaries);
      expect(result.current.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/beneficiaries?organizationId=org_123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('should return empty array when no beneficiaries exist', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: [],
        }),
      });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should include authorization token in request', async () => {
      mockUseAuth.mockReturnValue({
        getToken: jest.fn().mockResolvedValue('custom-token-456'),
      });

      renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer custom-token-456',
            }),
          })
        );
      });
    });

    it('should work without authorization token', async () => {
      mockUseAuth.mockReturnValue({
        getToken: jest.fn().mockResolvedValue(null),
      });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });

    it('should use correct query key with organizationId', async () => {
      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify that the query was cached with correct key
      const cachedData = queryClient.getQueryData(['beneficiaries', 'org_123']);
      expect(cachedData).toEqual(mockBeneficiaries);
    });

    it('should handle data property correctly from API response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockBeneficiaries,
          total: 2,
        }),
      });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockBeneficiaries);
    });
  });

  describe('No organization', () => {
    it('should not fetch when organization is null', async () => {
      mockUseOrganization.mockReturnValue({
        organization: null,
      });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should not fetch when organization is undefined', async () => {
      mockUseOrganization.mockReturnValue({
        organization: undefined,
      });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should fetch when organization becomes available', async () => {
      mockUseOrganization.mockReturnValue({
        organization: null,
      });

      const { result, rerender } = renderHook(() => useBeneficiaries(), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(global.fetch).not.toHaveBeenCalled();

      // Organization becomes available
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_456', name: 'New Org' },
      });

      rerender();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/beneficiaries?organizationId=org_456',
          expect.any(Object)
        );
      });
    });
  });

  describe('Error handling', () => {
    it('should handle API error responses', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeTruthy();
      expect(consoleErrorSpy).toHaveBeenCalledWith('  - Error:', 'Internal Server Error');

      consoleErrorSpy.mockRestore();
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeTruthy();
    });

    it('should handle 404 not found error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Not Found'),
      });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeTruthy();
      expect(consoleErrorSpy).toHaveBeenCalledWith('  - Error:', 'Not Found');

      consoleErrorSpy.mockRestore();
    });

    it('should handle 401 unauthorized error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        text: jest.fn().mockResolvedValue('Unauthorized'),
      });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeTruthy();

      consoleErrorSpy.mockRestore();
    });

    it('should handle 403 forbidden error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        text: jest.fn().mockResolvedValue('Forbidden'),
      });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeTruthy();

      consoleErrorSpy.mockRestore();
    });

    it('should throw error when NEXT_PUBLIC_API_URL is not defined', async () => {
      delete process.env.NEXT_PUBLIC_API_URL;

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toContain('NEXT_PUBLIC_API_URL non défini');
    });

    it('should handle malformed JSON response', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle text() error when response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: jest.fn().mockRejectedValue(new Error('Cannot read text')),
      });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('Query caching', () => {
    it('should use cached data for same organization', async () => {
      const { result, rerender } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Rerender with same organization
      rerender();

      // Should not fetch again
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockBeneficiaries);
    });

    it('should fetch new data when organization changes', async () => {
      const { result, rerender } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Change organization
      mockUseOrganization.mockReturnValue({
        organization: { id: 'org_789', name: 'Different Org' },
      });

      rerender();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      expect(global.fetch).toHaveBeenLastCalledWith(
        'https://api.example.com/beneficiaries?organizationId=org_789',
        expect.any(Object)
      );
    });
  });

  describe('Data structure', () => {
    it('should return data with correct structure', async () => {
      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const beneficiary = result.current.data[0];
      expect(beneficiary).toHaveProperty('id');
      expect(beneficiary).toHaveProperty('clerkUserId');
      expect(beneficiary).toHaveProperty('firstName');
      expect(beneficiary).toHaveProperty('lastName');
      expect(beneficiary).toHaveProperty('email');
      expect(beneficiary).toHaveProperty('phone');
      expect(beneficiary).toHaveProperty('status');
      expect(beneficiary).toHaveProperty('progressPercent');
      expect(beneficiary).toHaveProperty('createdAt');

      // Vérifier les types
      expect(typeof beneficiary.id).toBe('string');
      expect(typeof beneficiary.firstName).toBe('string');
      expect(typeof beneficiary.lastName).toBe('string');
      expect(typeof beneficiary.email).toBe('string');
      expect(typeof beneficiary.progressPercent).toBe('number');
    });

    it('should handle missing optional fields', async () => {
      const beneficiaryWithoutPhone = {
        ...mockBeneficiaries[0],
        phone: null,
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: [beneficiaryWithoutPhone],
        }),
      });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data[0].phone).toBeNull();
    });

    it('should return array of beneficiaries', async () => {
      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.data.length).toBe(2);
    });

    it('should preserve beneficiary status types', async () => {
      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data[0].status).toBe(BeneficiaryStatus.ACTIVE);
      expect(result.current.data[1].status).toBe(BeneficiaryStatus.INACTIVE);
    });
  });

  describe('Return value structure', () => {
    it('should return object with data, isLoading, and error properties', async () => {
      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
    });

    it('should default to empty array for data', () => {
      mockUseOrganization.mockReturnValue({ organization: null });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      expect(result.current.data).toEqual([]);
      expect(Array.isArray(result.current.data)).toBe(true);
    });
  });

  describe('Token refresh', () => {
    it('should call getToken on each fetch', async () => {
      const getTokenMock = jest.fn().mockResolvedValue('token-1');
      mockUseAuth.mockReturnValue({ getToken: getTokenMock });

      renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(getTokenMock).toHaveBeenCalled();
      });
    });

    it('should handle token retrieval failure', async () => {
      const getTokenMock = jest.fn().mockRejectedValue(new Error('Token error'));
      mockUseAuth.mockReturnValue({ getToken: getTokenMock });

      const { result } = renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Query parameters', () => {
    it('should include organizationId in query params', async () => {
      renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('organizationId=org_123'),
          expect.any(Object)
        );
      });
    });

    it('should construct correct URL with base API URL', async () => {
      renderHook(() => useBeneficiaries(), { wrapper });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/beneficiaries?organizationId=org_123',
          expect.any(Object)
        );
      });
    });
  });
});
