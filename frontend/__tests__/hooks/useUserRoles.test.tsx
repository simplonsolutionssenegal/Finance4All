import { useOrganizationList, useUser } from '@clerk/nextjs';
import { renderHook } from '@testing-library/react';

import { useUserRoles } from '@/hooks/useUserRoles';

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useOrganizationList: jest.fn(),
  useUser: jest.fn(),
}));

describe('useUserRoles', () => {
  const mockUseOrganizationList = useOrganizationList as jest.MockedFunction<
    typeof useOrganizationList
  >;
  const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return loading state when data is not loaded', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: false,
    } as any);
    mockUseOrganizationList.mockReturnValue({
      userMemberships: {
        data: undefined,
      },
      isLoaded: false,
    } as any);

    const { result } = renderHook(() => useUserRoles());
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.userRoles).toEqual([]);
    expect(result.current.hasOrganization).toBe(false);
    expect(result.current.isSystemAdmin).toBe(false);
    expect(result.current.roleLabel).toBe('Utilisateur');
  });

  it('should return empty roles when user has no roles', () => {
    mockUseUser.mockReturnValue({
      user: { publicMetadata: {} },
      isLoaded: true,
    } as any);
    mockUseOrganizationList.mockReturnValue({
      userMemberships: {
        data: [],
      },
      isLoaded: true,
    } as any);

    const { result } = renderHook(() => useUserRoles());
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.userRoles).toEqual([]);
    expect(result.current.isSystemAdmin).toBe(false);
    expect(result.current.hasOrganization).toBe(false);
  });

  it('should return admin role when user is system admin', () => {
    mockUseUser.mockReturnValue({
      user: { publicMetadata: { roles: ['admin'] } },
      isLoaded: true,
    } as any);
    mockUseOrganizationList.mockReturnValue({
      userMemberships: {
        data: [],
      },
      isLoaded: true,
    } as any);

    const { result } = renderHook(() => useUserRoles());
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.userRoles).toEqual(['admin']);
    expect(result.current.isSystemAdmin).toBe(true);
    expect(result.current.hasOrganization).toBe(false);
    expect(result.current.roleLabel).toBe('Super Admin');
    expect(result.current.hasRole('admin')).toBe(true);
  });

  it('should return organization roles when user has memberships', () => {
    mockUseUser.mockReturnValue({
      user: { publicMetadata: {} },
      isLoaded: true,
    } as any);
    mockUseOrganizationList.mockReturnValue({
      userMemberships: {
        data: [
          { role: 'org:admin', organization: { id: 'org-1' } },
          { role: 'org:member', organization: { id: 'org-2' } },
        ],
      },
      isLoaded: true,
    } as any);

    const { result } = renderHook(() => useUserRoles());
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.hasOrganization).toBe(true);
    expect(result.current.organizationRoles).toEqual(['org:admin', 'org:member']);
    expect(result.current.organizationMemberships).toEqual([
      { role: 'org:admin', organizationId: 'org-1' },
      { role: 'org:member', organizationId: 'org-2' },
    ]);
    expect(result.current.hasOrganizationRole('admin')).toBe(true);
    expect(result.current.hasOrganizationRole('member')).toBe(true);
  });

  it('should return correct role label for admin with organization', () => {
    mockUseUser.mockReturnValue({
      user: { publicMetadata: { roles: ['admin'] } },
      isLoaded: true,
    } as any);
    mockUseOrganizationList.mockReturnValue({
      userMemberships: {
        data: [{ role: 'org:admin', organization: { id: 'org-1' } }],
      },
      isLoaded: true,
    } as any);

    const { result } = renderHook(() => useUserRoles());
    expect(result.current.roleLabel).toBe('Super Admin');
  });

  it('should return correct role label for non-admin with organization', () => {
    mockUseUser.mockReturnValue({
      user: { publicMetadata: {} },
      isLoaded: true,
    } as any);
    mockUseOrganizationList.mockReturnValue({
      userMemberships: {
        data: [{ role: 'org:member', organization: { id: 'org-1' } }],
      },
      isLoaded: true,
    } as any);

    const { result } = renderHook(() => useUserRoles());
    expect(result.current.roleLabel).toBe('Admin');
  });

  it('should return correct role label for admin in metadata', () => {
    mockUseUser.mockReturnValue({
      user: {
        publicMetadata: {},
        unsafeMetadata: { role: 'admin' },
      },
      isLoaded: true,
    } as any);
    mockUseOrganizationList.mockReturnValue({
      userMemberships: {
        data: [],
      },
      isLoaded: true,
    } as any);

    const { result } = renderHook(() => useUserRoles());
    expect(result.current.roleLabel).toBe('Super Admin');
  });

  it('should check roles correctly with hasRole', () => {
    mockUseUser.mockReturnValue({
      user: { publicMetadata: { roles: ['admin', 'user'] } },
      isLoaded: true,
    } as any);
    mockUseOrganizationList.mockReturnValue({
      userMemberships: {
        data: [],
      },
      isLoaded: true,
    } as any);

    const { result } = renderHook(() => useUserRoles());
    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('user')).toBe(true);
    expect(result.current.hasRole('nonexistent')).toBe(false);
  });

  it('should check organization roles correctly with hasOrganizationRole', () => {
    mockUseUser.mockReturnValue({
      user: { publicMetadata: {} },
      isLoaded: true,
    } as any);
    mockUseOrganizationList.mockReturnValue({
      userMemberships: {
        data: [{ role: 'org:admin', organization: { id: 'org-1' } }],
      },
      isLoaded: true,
    } as any);

    const { result } = renderHook(() => useUserRoles());
    expect(result.current.hasOrganizationRole('admin')).toBe(true);
    expect(result.current.hasOrganizationRole('org:admin')).toBe(true);
    expect(result.current.hasOrganizationRole('member')).toBe(false);
  });
});
