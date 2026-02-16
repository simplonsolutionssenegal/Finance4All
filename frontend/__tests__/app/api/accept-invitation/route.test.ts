/**
 * @jest-environment node
 */
import type { NextRequest } from 'next/server';

// Mock NextRequest before importing the route
const mockCreateRequest = (body: any) => {
  return {
    json: jest.fn().mockResolvedValue(body),
    method: 'POST',
    url: 'http://localhost:3000/api/accept-invitation',
    headers: new Map([['content-type', 'application/json']]),
  } as unknown as NextRequest;
};

// Dynamic import to avoid import issues
let POST: any;

const mockGetOrganizationInvitation = jest.fn();
const mockCreateUser = jest.fn();
const mockCreateOrganizationMembership = jest.fn();
const mockRevokeOrganizationInvitation = jest.fn();

jest.mock('@clerk/nextjs/server', () => ({
  createClerkClient: jest.fn(() => ({
    organizations: {
      getOrganizationInvitation: mockGetOrganizationInvitation,
      createOrganizationMembership: mockCreateOrganizationMembership,
      revokeOrganizationInvitation: mockRevokeOrganizationInvitation,
    },
    users: {
      createUser: mockCreateUser,
    },
  })),
}));

const originalEnv = process.env;

describe('/api/accept-invitation', () => {
  beforeAll(async () => {
    const route = await import('@/app/api/accept-invitation/route');
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

  const validRequestBody = {
    invitationId: 'test-invitation-id',
    orgId: 'test-org-id',
    password: 'testPassword123',
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: 'john.doe@example.com',
  };

  const createRequest = (body: any) => mockCreateRequest(body);

  it('should return 400 if required fields are missing', async () => {
    const incompleteBody = { invitationId: 'test-id' };
    const request = createRequest(incompleteBody);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Tous les champs sont requis');
  });

  it('should return 404 if invitation is not found', async () => {
    mockGetOrganizationInvitation.mockResolvedValue(null);
    const request = createRequest(validRequestBody);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invitation non trouvée');
  });

  it('should return 500 if user creation fails', async () => {
    const mockInvitation = { id: 'inv-123', role: 'org:member' };
    mockGetOrganizationInvitation.mockResolvedValue(mockInvitation);
    mockCreateUser.mockResolvedValue(null);
    const request = createRequest(validRequestBody);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Erreur lors de la création du compte utilisateur');
  });

  it('should successfully accept invitation and create user', async () => {
    const mockInvitation = { id: 'inv-123', role: 'org:member' };
    const mockUser = { id: 'user-123' };

    mockGetOrganizationInvitation.mockResolvedValue(mockInvitation);
    mockCreateUser.mockResolvedValue(mockUser);
    mockCreateOrganizationMembership.mockResolvedValue({});
    mockRevokeOrganizationInvitation.mockResolvedValue({});

    const request = createRequest(validRequestBody);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Compte créé et invitation acceptée avec succès');
    expect(data.userId).toBe('user-123');

    expect(mockCreateUser).toHaveBeenCalledWith({
      emailAddress: ['john.doe@example.com'],
      password: 'testPassword123',
      publicMetadata: {
        firstName: 'John',
        lastName: 'Doe',
      },
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(mockCreateOrganizationMembership).toHaveBeenCalledWith({
      organizationId: 'test-org-id',
      userId: 'user-123',
      role: 'org:member',
    });

    expect(mockRevokeOrganizationInvitation).toHaveBeenCalledWith({
      organizationId: 'test-org-id',
      invitationId: 'test-invitation-id',
    });
  });

  it('should handle clerk errors gracefully', async () => {
    mockGetOrganizationInvitation.mockRejectedValue(new Error('Clerk API Error'));
    const request = createRequest(validRequestBody);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toContain("Erreur lors de l'acceptation: Clerk API Error");
  });

  it('should return specific error message for compromised passwords', async () => {
    // Mock a Clerk error with errors array properly structured
    const clerkError = {
      errors: [
        {
          code: 'form_password_pwned',
          message: 'Password has been found in a breach',
        },
      ],
    };

    mockGetOrganizationInvitation.mockResolvedValue({ id: 'inv-123', role: 'org:member' });
    mockCreateUser.mockRejectedValue(clerkError);

    const request = createRequest(validRequestBody);

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500); // Or whatever status Clerk error maps to, assuming 500 based on code
    expect(data.success).toBe(false);
    expect(data.message).toBe(
      'Ce mot de passe a été trouvé dans une fuite de données publique. Pour la sécurité de votre compte, veuillez en choisir un autre.'
    );
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

  it('should validate each required field individually', async () => {
    const requiredFields = [
      'invitationId',
      'orgId',
      'password',
      'firstName',
      'lastName',
      'emailAddress',
    ];

    // Tester chaque champ individuellement pour éviter await-in-loop
    const testResults = await Promise.all(
      requiredFields.map(async field => {
        const invalidBody = { ...validRequestBody };
        delete invalidBody[field as keyof typeof validRequestBody];

        const request = createRequest(invalidBody);
        const response = await POST(request);
        const data = await response.json();

        return {
          field,
          status: response.status,
          success: data.success,
          message: data.message,
        };
      })
    );

    // Vérifier que tous les tests ont échoué comme attendu
    testResults.forEach(result => {
      expect(result.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Tous les champs sont requis');
    });
  });
});
