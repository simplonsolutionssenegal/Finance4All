import { useOrganizationList, useUser, useOrganization } from '@clerk/nextjs';
import { renderHook } from '@testing-library/react';

import { useUserRoles } from '@/hooks/useUserRoles';

jest.mock('@clerk/nextjs', () => ({
  useOrganizationList: jest.fn(),
  useUser: jest.fn(),
  useOrganization: jest.fn(),
}));

const mockUseOrganizationList = useOrganizationList as jest.MockedFunction<
  typeof useOrganizationList
>;
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseOrganization = useOrganization as jest.MockedFunction<typeof useOrganization>;

function setupMocks({
  user = { publicMetadata: {}, unsafeMetadata: {} } as any,
  userLoaded = true,
  memberships = [] as any[],
  orgListLoaded = true,
  organization = null as any,
  membership = null as any,
} = {}) {
  mockUseUser.mockReturnValue({ user: userLoaded ? user : null, isLoaded: userLoaded } as any);
  mockUseOrganizationList.mockReturnValue({
    userMemberships: { data: memberships },
    isLoaded: orgListLoaded,
  } as any);
  mockUseOrganization.mockReturnValue({ organization, membership } as any);
}

describe('useUserRoles', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns loading state when data is not loaded', () => {
    setupMocks({ userLoaded: false, orgListLoaded: false });
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.roleLabel).toBe('Utilisateur');
    expect(result.current.appRole).toBe('Beneficiare');
  });

  it('returns Beneficiare role when user has no roles', () => {
    setupMocks();
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.appRole).toBe('Beneficiare');
    expect(result.current.accessGroup).toBe('beneficiary');
  });

  it('returns Admin role for org:admin in admin org', () => {
    setupMocks({
      user: { publicMetadata: { roles: ['admin'] } },
      organization: { publicMetadata: { type: 'admin' } },
      membership: { role: 'org:admin' },
      memberships: [{ role: 'org:admin', organization: { id: 'org-1' } }],
    });
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.appRole).toBe('Admin');
    expect(result.current.accessGroup).toBe('platform');
    expect(result.current.roleLabel).toBe('Admin Systeme');
  });

  it('returns AdminMember role for org:member in admin org', () => {
    setupMocks({
      organization: { publicMetadata: { type: 'admin' } },
      membership: { role: 'org:member' },
      memberships: [{ role: 'org:member', organization: { id: 'org-1' } }],
    });
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.appRole).toBe('AdminMember');
    expect(result.current.accessGroup).toBe('platform');
  });

  it('returns AdminOrg for org:admin in partner org', () => {
    setupMocks({
      organization: { publicMetadata: { type: 'partner' } },
      membership: { role: 'org:admin' },
      memberships: [{ role: 'org:admin', organization: { id: 'org-1' } }],
    });
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.appRole).toBe('AdminOrg');
    expect(result.current.accessGroup).toBe('organization');
  });

  it('returns MemberOrg for org:member in partner org', () => {
    setupMocks({
      organization: { publicMetadata: {} },
      membership: { role: 'org:member' },
      memberships: [{ role: 'org:member', organization: { id: 'org-1' } }],
    });
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.appRole).toBe('MemberOrg');
    expect(result.current.accessGroup).toBe('organization');
  });

  it('returns Recipient for org:recipient', () => {
    setupMocks({
      organization: { publicMetadata: {} },
      membership: { role: 'org:recipient' },
      memberships: [{ role: 'org:recipient', organization: { id: 'org-1' } }],
    });
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.appRole).toBe('Recipient');
    expect(result.current.accessGroup).toBe('beneficiary');
  });

  it('returns Beneficiare for user with beneficiary metadata', () => {
    setupMocks({
      user: { publicMetadata: {}, unsafeMetadata: { role: 'beneficiary' } },
    });
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.appRole).toBe('Beneficiare');
    expect(result.current.accessGroup).toBe('beneficiary');
  });

  it('preserves legacy fields (userRoles, isSystemAdmin, etc.)', () => {
    setupMocks({
      user: { publicMetadata: { roles: ['admin'] } },
      memberships: [{ role: 'org:admin', organization: { id: 'org-1' } }],
    });
    const { result } = renderHook(() => useUserRoles());
    expect(result.current.userRoles).toEqual(['admin']);
    expect(result.current.isSystemAdmin).toBe(true);
    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasOrganizationRole('org:admin')).toBe(true);
  });
});
