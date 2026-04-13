const mockAuth = jest.fn();
const mockCreateClerkClient = jest.fn();
const mockResolveAppRole = jest.fn();

jest.mock('@clerk/nextjs/server', () => ({
  auth: (...args: unknown[]) => mockAuth(...args),
  createClerkClient: (...args: unknown[]) => mockCreateClerkClient(...args),
}));

jest.mock('@/lib/role-access', () => ({
  resolveAppRole: (...args: unknown[]) => mockResolveAppRole(...args),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => {
      const status = init?.status ?? 200;
      return {
        status,
        json: async () => body,
        headers: new Headers(),
      };
    }),
  },
}));

import { NextResponse } from 'next/server';
import { GET } from '@/app/api/organizations/stats/route';

describe('GET /api/organizations/stats', () => {
  const mockGetOrganizationList = jest.fn();
  const mockGetOrganizationMembershipList = jest.fn();
  const mockGetOrganizationInvitationList = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateClerkClient.mockReturnValue({
      organizations: {
        getOrganizationList: mockGetOrganizationList,
        getOrganizationMembershipList: mockGetOrganizationMembershipList,
        getOrganizationInvitationList: mockGetOrganizationInvitationList,
      },
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null, orgRole: null, sessionClaims: null });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Non authentifie');
  });

  it('returns 403 when role is not Admin or AdminMember', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      orgRole: 'org:member',
      sessionClaims: { org_public_metadata: {}, unsafe_metadata: {}, public_metadata: {} },
    });
    mockResolveAppRole.mockReturnValue('Member');

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Acces refuse');
  });

  it('returns stats successfully for Admin role', async () => {
    mockAuth.mockResolvedValue({
      userId: 'platform_admin_1',
      orgRole: 'org:admin',
      sessionClaims: {
        org_public_metadata: { type: 'admin' },
        unsafe_metadata: {},
        public_metadata: {},
      },
    });
    mockResolveAppRole.mockReturnValue('Admin');

    mockGetOrganizationList.mockResolvedValue({
      data: [
        { id: 'org_admin_1', name: 'Admin Org', publicMetadata: { type: 'admin' } },
        { id: 'org_partner_1', name: 'Partner Org', publicMetadata: { type: 'partner' } },
      ],
    });

    // Admin org memberships (the platform admin themselves should be skipped)
    mockGetOrganizationMembershipList.mockImplementation(
      ({ organizationId }: { organizationId: string }) => {
        if (organizationId === 'org_admin_1') {
          return Promise.resolve({
            data: [
              {
                id: 'mem_1',
                role: 'org:admin',
                publicUserData: {
                  userId: 'platform_admin_1',
                  firstName: 'Platform',
                  lastName: 'Admin',
                  identifier: 'admin@test.com',
                },
                createdAt: 1700000000000,
              },
              {
                id: 'mem_2',
                role: 'org:member',
                publicUserData: {
                  userId: 'user_2',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  identifier: 'jane@test.com',
                },
                createdAt: 1700000000000,
              },
            ],
          });
        }
        // Partner org memberships
        return Promise.resolve({
          data: [
            {
              id: 'mem_3',
              role: 'org:admin',
              publicUserData: {
                userId: 'user_3',
                firstName: 'Bob',
                lastName: 'Smith',
                identifier: 'bob@test.com',
              },
              createdAt: 1700000000000,
            },
            {
              id: 'mem_4',
              role: 'org:recipient',
              publicUserData: {
                userId: 'user_4',
                firstName: 'Alice',
                lastName: 'Jones',
                identifier: 'alice@test.com',
              },
              createdAt: 1700000000000,
            },
          ],
        });
      }
    );

    mockGetOrganizationInvitationList.mockResolvedValue({ data: [] });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.stats).toEqual({
      totalUsers: 3, // user_2 (admin org, not self), user_3 (partner), user_4 (partner)
      totalOrganizations: 1, // 1 partner org
      adminsOrg: 1,
      membersOrg: 0,
      recipients: 1,
      platformAdmins: 0, // platform_admin_1 is skipped
      platformMembers: 1, // user_2
    });
    expect(body.data.users).toHaveLength(3);
  });

  it('handles server error and returns 500', async () => {
    mockAuth.mockRejectedValue(new Error('Internal failure'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Erreur serveur');
    expect(body.message).toContain('Internal failure');
  });
});
