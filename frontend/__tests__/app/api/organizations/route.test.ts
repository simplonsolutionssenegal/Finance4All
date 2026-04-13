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
import { POST } from '@/app/api/organizations/route';
import type { NextRequest } from 'next/server';

function createMockRequest(body: Record<string, unknown>): NextRequest {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

describe('POST /api/organizations', () => {
  const mockCreateOrganization = jest.fn();
  const mockDeleteOrganizationMembership = jest.fn();
  const mockGetUserList = jest.fn();
  const mockCreateUser = jest.fn();
  const mockCreateOrganizationMembership = jest.fn();

  const validBody = {
    name: 'Test Org',
    country: 'Senegal',
    address: '123 Main St',
    adminFirstName: 'John',
    adminLastName: 'Doe',
    adminEmail: 'john@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateClerkClient.mockReturnValue({
      organizations: {
        createOrganization: mockCreateOrganization,
        deleteOrganizationMembership: mockDeleteOrganizationMembership,
        createOrganizationMembership: mockCreateOrganizationMembership,
      },
      users: {
        getUserList: mockGetUserList,
        createUser: mockCreateUser,
      },
    });
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null, orgRole: null, sessionClaims: null });

    const response = await POST(createMockRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Non authentifie');
  });

  it('returns 403 for non-admin role', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      orgRole: 'org:member',
      sessionClaims: { org_public_metadata: {}, unsafe_metadata: {}, public_metadata: {} },
    });
    mockResolveAppRole.mockReturnValue('Member');

    const response = await POST(createMockRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Acces refuse');
  });

  it('returns 400 for missing required fields', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      orgRole: 'org:admin',
      sessionClaims: {
        org_public_metadata: { type: 'admin' },
        unsafe_metadata: {},
        public_metadata: {},
      },
    });
    mockResolveAppRole.mockReturnValue('Admin');

    const incompleteBody = { name: 'Test Org', country: 'Senegal' };
    const response = await POST(createMockRequest(incompleteBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Tous les champs sont requis');
  });

  it('successfully creates an organization with a new user', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      orgRole: 'org:admin',
      sessionClaims: {
        org_public_metadata: { type: 'admin' },
        unsafe_metadata: {},
        public_metadata: {},
      },
    });
    mockResolveAppRole.mockReturnValue('Admin');

    mockCreateOrganization.mockResolvedValue({ id: 'org_new', name: 'Test Org' });
    mockDeleteOrganizationMembership.mockResolvedValue({});
    mockGetUserList.mockResolvedValue({ data: [] });
    mockCreateUser.mockResolvedValue({ id: 'new_admin_user' });
    mockCreateOrganizationMembership.mockResolvedValue({});

    const response = await POST(createMockRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.organizationId).toBe('org_new');
    expect(body.organizationName).toBe('Test Org');
    expect(body.adminUserId).toBe('new_admin_user');

    expect(mockCreateOrganization).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Test Org', createdBy: 'user_123' })
    );
    expect(mockDeleteOrganizationMembership).toHaveBeenCalledWith({
      organizationId: 'org_new',
      userId: 'user_123',
    });
    expect(mockCreateUser).toHaveBeenCalledWith(
      expect.objectContaining({
        emailAddress: ['john@example.com'],
        firstName: 'John',
        lastName: 'Doe',
      })
    );
    expect(mockCreateOrganizationMembership).toHaveBeenCalledWith({
      organizationId: 'org_new',
      userId: 'new_admin_user',
      role: 'org:admin',
    });
  });

  it('successfully creates an organization with an existing user', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      orgRole: 'org:admin',
      sessionClaims: {
        org_public_metadata: { type: 'admin' },
        unsafe_metadata: {},
        public_metadata: {},
      },
    });
    mockResolveAppRole.mockReturnValue('AdminMember');

    mockCreateOrganization.mockResolvedValue({ id: 'org_new', name: 'Test Org' });
    mockDeleteOrganizationMembership.mockResolvedValue({});
    mockGetUserList.mockResolvedValue({ data: [{ id: 'existing_user_id' }] });
    mockCreateOrganizationMembership.mockResolvedValue({});

    const response = await POST(createMockRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.adminUserId).toBe('existing_user_id');
    expect(mockCreateUser).not.toHaveBeenCalled();
    expect(mockCreateOrganizationMembership).toHaveBeenCalledWith({
      organizationId: 'org_new',
      userId: 'existing_user_id',
      role: 'org:admin',
    });
  });

  it('handles Clerk duplicate_record error and returns 409', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      orgRole: 'org:admin',
      sessionClaims: {
        org_public_metadata: { type: 'admin' },
        unsafe_metadata: {},
        public_metadata: {},
      },
    });
    mockResolveAppRole.mockReturnValue('Admin');

    mockCreateOrganization.mockRejectedValue({
      errors: [{ code: 'duplicate_record', longMessage: 'Organization already exists' }],
    });

    const response = await POST(createMockRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Organization already exists');
  });

  it('handles generic error and returns 500', async () => {
    mockAuth.mockResolvedValue({
      userId: 'user_123',
      orgRole: 'org:admin',
      sessionClaims: {
        org_public_metadata: { type: 'admin' },
        unsafe_metadata: {},
        public_metadata: {},
      },
    });
    mockResolveAppRole.mockReturnValue('Admin');

    mockCreateOrganization.mockRejectedValue(new Error('Connection timeout'));

    const response = await POST(createMockRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Connection timeout');
  });
});
