/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server';

// Mock NextRequest before importing the route
const mockCreateRequest = (body: any) => {
  return {
    json: jest.fn().mockResolvedValue(body),
    method: 'POST',
    url: 'http://localhost:3000/api/get-invitation',
    headers: new Map([['content-type', 'application/json']]),
  } as unknown as NextRequest;
};

// Dynamic import to avoid import issues
let POST: any;

const mockGetOrganizationInvitation = jest.fn();
const mockGetOrganization = jest.fn();

jest.mock('@clerk/nextjs/server', () => ({
  createClerkClient: jest.fn(() => ({
    organizations: {
      getOrganizationInvitation: mockGetOrganizationInvitation,
      getOrganization: mockGetOrganization,
    },
  })),
}));

const originalEnv = process.env;

describe('/api/get-invitation', () => {
  beforeAll(async () => {
    const route = await import('@/app/api/get-invitation/route');
    POST = route.POST;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      CLERK_SECRET_KEY: 'test-secret-key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const createRequest = (body: any) => mockCreateRequest(body);

  it('should return 400 if invitationId is missing', async () => {
    const request = createRequest({ orgId: 'test-org-id' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe("ID d'invitation requis");
    expect(data.error).toBe('MISSING_INVITATION_ID');
  });

  it('should return 400 if orgId is missing', async () => {
    const request = createRequest({ invitationId: 'test-invitation-id' });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe("ID de l'organisation requis");
    expect(data.error).toBe('MISSING_ORG_ID');
  });

  it('should return 404 if invitation is not found', async () => {
    mockGetOrganizationInvitation.mockResolvedValue(null);
    const request = createRequest({
      invitationId: 'non-existent-invitation',
      orgId: 'test-org-id',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invitation non trouvée dans aucune organisation');
  });

  it('should successfully return invitation data', async () => {
    const mockInvitation = {
      id: 'test-invitation-id',
      emailAddress: 'john.doe@example.com',
      role: 'org:member',
      status: 'pending',
      publicMetadata: {},
      createdAt: new Date('2024-01-01').getTime(),
      updatedAt: new Date('2024-01-01').getTime(),
    };

    const mockOrganization = {
      name: 'Test Organization',
    };

    mockGetOrganizationInvitation.mockResolvedValue(mockInvitation);
    mockGetOrganization.mockResolvedValue(mockOrganization);

    const request = createRequest({
      invitationId: 'test-invitation-id',
      orgId: 'test-org-id',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.invitation).toEqual({
      id: 'test-invitation-id',
      emailAddress: 'john.doe@example.com',
      role: 'org:member',
      status: 'pending',
      publicMetadata: {},
      organizationName: 'Test Organization',
      organizationId: 'test-org-id',
      createdAt: mockInvitation.createdAt,
      updatedAt: mockInvitation.updatedAt,
    });

    expect(mockGetOrganizationInvitation).toHaveBeenCalledWith({
      organizationId: 'test-org-id',
      invitationId: 'test-invitation-id',
    });

    expect(mockGetOrganization).toHaveBeenCalledWith({
      organizationId: 'test-org-id',
    });
  });

  it('should use fallback organization name if organization is not found', async () => {
    const mockInvitation = {
      id: 'test-invitation-id',
      emailAddress: 'john.doe@example.com',
      role: 'org:admin',
      status: 'pending',
      publicMetadata: { test: 'data' },
      createdAt: new Date('2024-01-01').getTime(),
      updatedAt: new Date('2024-01-02').getTime(),
    };

    mockGetOrganizationInvitation.mockResolvedValue(mockInvitation);
    mockGetOrganization.mockResolvedValue(null);

    const request = createRequest({
      invitationId: 'test-invitation-id',
      orgId: 'test-org-id',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.invitation.organizationName).toBe('Organisation');
  });

  it('should handle clerk errors gracefully', async () => {
    mockGetOrganizationInvitation.mockRejectedValue(new Error('Clerk API Error'));
    const request = createRequest({
      invitationId: 'test-invitation-id',
      orgId: 'test-org-id',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Erreur lors de la recherche: Clerk API Error');
  });

  it('should handle JSON parsing errors', async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Erreur serveur: Invalid JSON');
  });

  it('should handle organization fetch errors separately from invitation errors', async () => {
    const mockInvitation = {
      id: 'test-invitation-id',
      emailAddress: 'john.doe@example.com',
      role: 'org:member',
      status: 'pending',
      publicMetadata: {},
      createdAt: new Date('2024-01-01').getTime(),
      updatedAt: new Date('2024-01-01').getTime(),
    };

    mockGetOrganizationInvitation.mockResolvedValue(mockInvitation);
    mockGetOrganization.mockRejectedValue(new Error('Organization API Error'));

    const request = createRequest({
      invitationId: 'test-invitation-id',
      orgId: 'test-org-id',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toContain('Erreur lors de la recherche: Organization API Error');
  });
});
