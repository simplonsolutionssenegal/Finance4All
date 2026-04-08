import { renderHook } from '@testing-library/react';
import { useAuth } from '@clerk/nextjs';

import { getUserRedirectPath, useGetUserRedirect } from '@/lib/get-user-redirect';

jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('get-user-redirect', () => {
  describe('getUserRedirectPath', () => {
    it('always returns /dashboard', () => {
      expect(getUserRedirectPath()).toBe('/dashboard');
    });
  });

  describe('useGetUserRedirect', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('returns /dashboard and isLoaded true when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        userId: 'user_123',
        orgId: null,
      } as any);

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.redirectUrl).toBe('/dashboard');
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.hasOrganization).toBe(false);
    });

    it('returns isLoaded false when auth not loaded', () => {
      mockUseAuth.mockReturnValue({
        isLoaded: false,
        userId: null,
        orgId: null,
      } as any);

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.redirectUrl).toBe('/dashboard');
      expect(result.current.isLoaded).toBe(false);
    });

    it('returns isLoaded false when userId is null even if auth loaded', () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        userId: null,
        orgId: null,
      } as any);

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.isLoaded).toBe(false);
    });

    it('returns hasOrganization true when orgId is set', () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        userId: 'user_123',
        orgId: 'org_456',
      } as any);

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.redirectUrl).toBe('/dashboard');
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.hasOrganization).toBe(true);
    });

    it('always returns /dashboard regardless of org status', () => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        userId: 'user_beneficiary',
        orgId: null,
      } as any);

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.redirectUrl).toBe('/dashboard');
    });
  });
});
