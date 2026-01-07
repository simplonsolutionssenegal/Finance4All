import { useUser } from '@clerk/nextjs';
import { renderHook } from '@testing-library/react';

import { useUserRoles } from '@/hooks/useUserRoles';
import { getUserRedirectPath, useGetUserRedirect } from '@/lib/get-user-redirect';

// Mock hooks
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

jest.mock('@/hooks/useUserRoles', () => ({
  useUserRoles: jest.fn(),
}));

describe('get-user-redirect', () => {
  describe('getUserRedirectPath', () => {
    it('should return /beneficiaire-dashboard when no memberships and no admin role', () => {
      expect(getUserRedirectPath(null, null)).toBe('/beneficiaire-dashboard');
      expect(getUserRedirectPath([], null)).toBe('/beneficiaire-dashboard');
      expect(getUserRedirectPath(null, [])).toBe('/beneficiaire-dashboard');
    });

    it('should return /dashboard when user is global admin and not in organization', () => {
      expect(getUserRedirectPath(['admin'], null)).toBe('/dashboard');
      expect(getUserRedirectPath(['admin'], [])).toBe('/dashboard');
    });

    it('should return /organisation-dashboard when user is global admin but also in organization', () => {
      const memberships = [{ role: 'org:admin' }];
      expect(getUserRedirectPath(['admin'], memberships)).toBe('/organisation-dashboard');
    });

    it('should return /beneficiaire-dashboard when user has recipient role', () => {
      const memberships = [{ role: 'org:recipient' }];
      expect(getUserRedirectPath(null, memberships)).toBe('/beneficiaire-dashboard');
    });

    it('should return /beneficiaire-dashboard when user has recipient role among multiple roles', () => {
      const memberships = [
        { role: 'org:admin' },
        { role: 'org:recipient' },
        { role: 'org:member' },
      ];
      expect(getUserRedirectPath(null, memberships)).toBe('/beneficiaire-dashboard');
    });

    it('should return /organisation-dashboard when user has admin role only', () => {
      const memberships = [{ role: 'org:admin' }];
      expect(getUserRedirectPath(null, memberships)).toBe('/organisation-dashboard');
    });

    it('should return /organisation-dashboard when user has member role only', () => {
      const memberships = [{ role: 'org:member' }];
      expect(getUserRedirectPath(null, memberships)).toBe('/organisation-dashboard');
    });

    it('should return /organisation-dashboard when user has admin and member roles (no recipient)', () => {
      const memberships = [{ role: 'org:admin' }, { role: 'org:member' }];
      expect(getUserRedirectPath(null, memberships)).toBe('/organisation-dashboard');
    });

    it('should handle empty role strings in memberships', () => {
      const memberships = [{ role: '' }];
      expect(getUserRedirectPath(null, memberships)).toBe('/organisation-dashboard');
    });

    it('should handle multiple memberships with various roles', () => {
      const memberships = [{ role: 'org:member' }, { role: 'org:admin' }];
      expect(getUserRedirectPath(null, memberships)).toBe('/organisation-dashboard');
    });

    it('should use custom paths from options', () => {
      const options = {
        adminDashboardPath: '/custom-admin',
        organizationDashboardPath: '/custom-org',
        beneficiaryDashboardPath: '/custom-beneficiary',
      };
      expect(getUserRedirectPath(['admin'], null, options)).toBe('/custom-admin');
      expect(getUserRedirectPath(null, [{ role: 'org:admin' }], options)).toBe('/custom-org');
      expect(getUserRedirectPath(null, [{ role: 'org:recipient' }], options)).toBe(
        '/custom-beneficiary'
      );
    });

    it('should return /beneficiaire-dashboard for beneficiary without organization', () => {
      const userMetadata = {
        unsafeMetadata: { role: 'beneficiary' },
        publicMetadata: {},
        externalAccounts: [],
      };
      expect(getUserRedirectPath(null, null, {}, userMetadata)).toBe('/beneficiaire-dashboard');
    });

    it('should return /beneficiaire-dashboard for beneficiary with BENEFICIAIRE role', () => {
      const userMetadata = {
        unsafeMetadata: { role: 'BENEFICIAIRE' },
        publicMetadata: {},
        externalAccounts: [],
      };
      expect(getUserRedirectPath(null, null, {}, userMetadata)).toBe('/beneficiaire-dashboard');
    });

    it('should prioritize organization membership over beneficiary metadata', () => {
      const userMetadata = {
        unsafeMetadata: { role: 'beneficiary' },
        publicMetadata: {},
        externalAccounts: [],
      };
      const memberships = [{ role: 'org:admin' }];
      // Si dans une organisation, on suit le rôle de l'organisation
      expect(getUserRedirectPath(null, memberships, {}, userMetadata)).toBe(
        '/organisation-dashboard'
      );
    });
  });

  describe('useGetUserRedirect', () => {
    const mockUseUserRoles = useUserRoles as jest.MockedFunction<typeof useUserRoles>;
    const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

    beforeEach(() => {
      jest.clearAllMocks();
      // Mock par défaut pour useUser (utilisé pour les métadonnées)
      mockUseUser.mockReturnValue({
        user: {
          unsafeMetadata: {},
          publicMetadata: {},
          externalAccounts: [],
        },
        isLoaded: true,
      } as any);
    });

    it('should return loading state when data is not loaded', () => {
      mockUseUserRoles.mockReturnValue({
        userRoles: [],
        isSystemAdmin: false,
        organizationRoles: [],
        organizationMemberships: [],
        hasOrganization: false,
        roleLabel: 'Utilisateur',
        isLoaded: false,
        hasRole: jest.fn(),
        hasOrganizationRole: jest.fn(),
      });

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.isLoaded).toBe(false);
      expect(result.current.redirectUrl).toBe('/beneficiaire-dashboard');
      expect(result.current.userRoles).toEqual([]);
      expect(result.current.hasOrganization).toBe(false);
    });

    it('should return /beneficiaire-dashboard when no memberships and no admin role', () => {
      mockUseUserRoles.mockReturnValue({
        userRoles: [],
        isSystemAdmin: false,
        organizationRoles: [],
        organizationMemberships: [],
        hasOrganization: false,
        roleLabel: 'Utilisateur',
        isLoaded: true,
        hasRole: jest.fn(),
        hasOrganizationRole: jest.fn(),
      });

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.redirectUrl).toBe('/beneficiaire-dashboard');
      expect(result.current.userRoles).toEqual([]);
      expect(result.current.hasOrganization).toBe(false);
    });

    it('should return /dashboard when user is global admin and not in organization', () => {
      mockUseUserRoles.mockReturnValue({
        userRoles: ['admin'],
        isSystemAdmin: true,
        organizationRoles: [],
        organizationMemberships: [],
        hasOrganization: false,
        roleLabel: 'Super Admin',
        isLoaded: true,
        hasRole: jest.fn((role: string) => role === 'admin'),
        hasOrganizationRole: jest.fn(),
      });

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.redirectUrl).toBe('/dashboard');
      expect(result.current.userRoles).toEqual(['admin']);
      expect(result.current.hasOrganization).toBe(false);
    });

    it('should return /organisation-dashboard when user is global admin but also in organization', () => {
      mockUseUserRoles.mockReturnValue({
        userRoles: ['admin'],
        isSystemAdmin: true,
        organizationRoles: ['org:admin'],
        organizationMemberships: [{ role: 'org:admin', organizationId: 'org_1' }],
        hasOrganization: true,
        roleLabel: 'Super Admin',
        isLoaded: true,
        hasRole: jest.fn((role: string) => role === 'admin'),
        hasOrganizationRole: jest.fn(),
      });

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.redirectUrl).toBe('/organisation-dashboard');
      expect(result.current.userRoles).toEqual(['admin']);
      expect(result.current.hasOrganization).toBe(true);
    });

    it('should return /beneficiaire-dashboard when memberships array is empty and no admin role', () => {
      mockUseUserRoles.mockReturnValue({
        userRoles: [],
        isSystemAdmin: false,
        organizationRoles: [],
        organizationMemberships: [],
        hasOrganization: false,
        roleLabel: 'Utilisateur',
        isLoaded: true,
        hasRole: jest.fn(),
        hasOrganizationRole: jest.fn(),
      });

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.redirectUrl).toBe('/beneficiaire-dashboard');
      expect(result.current.userRoles).toEqual([]);
      expect(result.current.hasOrganization).toBe(false);
    });

    it('should return /beneficiaire-dashboard when user has recipient role', () => {
      mockUseUserRoles.mockReturnValue({
        userRoles: [],
        isSystemAdmin: false,
        organizationRoles: ['org:recipient'],
        organizationMemberships: [{ role: 'org:recipient', organizationId: 'org_1' }],
        hasOrganization: true,
        roleLabel: 'Admin',
        isLoaded: true,
        hasRole: jest.fn(),
        hasOrganizationRole: jest.fn(
          (role: string) => role === 'recipient' || role === 'org:recipient'
        ),
      });

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.redirectUrl).toBe('/beneficiaire-dashboard');
      expect(result.current.hasOrganization).toBe(true);
    });

    it('should return /organisation-dashboard when user has admin role', () => {
      mockUseUserRoles.mockReturnValue({
        userRoles: [],
        isSystemAdmin: false,
        organizationRoles: ['org:admin'],
        organizationMemberships: [{ role: 'org:admin', organizationId: 'org_1' }],
        hasOrganization: true,
        roleLabel: 'Super Admin',
        isLoaded: true,
        hasRole: jest.fn(),
        hasOrganizationRole: jest.fn((role: string) => role === 'admin' || role === 'org:admin'),
      });

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.redirectUrl).toBe('/organisation-dashboard');
      expect(result.current.hasOrganization).toBe(true);
    });

    it('should return /organisation-dashboard when user has member role', () => {
      mockUseUserRoles.mockReturnValue({
        userRoles: [],
        isSystemAdmin: false,
        organizationRoles: ['org:member'],
        organizationMemberships: [{ role: 'org:member', organizationId: 'org_1' }],
        hasOrganization: true,
        roleLabel: 'Admin',
        isLoaded: true,
        hasRole: jest.fn(),
        hasOrganizationRole: jest.fn((role: string) => role === 'member' || role === 'org:member'),
      });

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.redirectUrl).toBe('/organisation-dashboard');
      expect(result.current.hasOrganization).toBe(true);
    });

    it('should map organizationMemberships data correctly', () => {
      mockUseUserRoles.mockReturnValue({
        userRoles: [],
        isSystemAdmin: false,
        organizationRoles: ['org:admin', 'org:member'],
        organizationMemberships: [
          { role: 'org:admin', organizationId: 'org_1' },
          { role: 'org:member', organizationId: 'org_2' },
        ],
        hasOrganization: true,
        roleLabel: 'Super Admin',
        isLoaded: true,
        hasRole: jest.fn(),
        hasOrganizationRole: jest.fn(),
      });

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.redirectUrl).toBe('/organisation-dashboard');
      expect(result.current.hasOrganization).toBe(true);
      expect(mockUseUserRoles).toHaveBeenCalled();
    });

    it('should return /beneficiaire-dashboard when recipient role is present with other roles', () => {
      mockUseUserRoles.mockReturnValue({
        userRoles: [],
        isSystemAdmin: false,
        organizationRoles: ['org:admin', 'org:recipient', 'org:member'],
        organizationMemberships: [
          { role: 'org:admin', organizationId: 'org_1' },
          { role: 'org:recipient', organizationId: 'org_2' },
          { role: 'org:member', organizationId: 'org_3' },
        ],
        hasOrganization: true,
        roleLabel: 'Admin',
        isLoaded: true,
        hasRole: jest.fn(),
        hasOrganizationRole: jest.fn(),
      });

      const { result } = renderHook(() => useGetUserRedirect());
      expect(result.current.isLoaded).toBe(true);
      expect(result.current.redirectUrl).toBe('/beneficiaire-dashboard');
      expect(result.current.hasOrganization).toBe(true);
    });

    it('should use custom paths from options', () => {
      const options = {
        adminDashboardPath: '/custom-admin',
        organizationDashboardPath: '/custom-org',
        beneficiaryDashboardPath: '/custom-beneficiary',
      };

      mockUseUserRoles.mockReturnValue({
        userRoles: ['admin'],
        isSystemAdmin: true,
        organizationRoles: [],
        organizationMemberships: [],
        hasOrganization: false,
        roleLabel: 'Super Admin',
        isLoaded: true,
        hasRole: jest.fn((role: string) => role === 'admin'),
        hasOrganizationRole: jest.fn(),
      });

      const { result } = renderHook(() => useGetUserRedirect(options));
      expect(result.current.redirectUrl).toBe('/custom-admin');
    });
  });
});
