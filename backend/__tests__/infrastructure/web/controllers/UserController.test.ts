import { Request, Response } from 'express';
import { UserController } from '@/infrastructure/web/controllers/UserController';
import { RemoveUserUseCase } from '@/application/use-cases/RemoveUserUseCase';
import { UpdateUserRoleUseCase } from '@/application/use-cases/UpdateUserRoleUseCase';
import { getAuth, clerkClient } from '@clerk/express';

// Mocking emailService
jest.mock('@/utils/emailService', () => ({
  sendInvitationEmail: jest.fn(),
}));

// Mocking logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mocking Clerk
jest.mock('@clerk/express', () => ({
  getAuth: jest.fn(),
  clerkClient: {
    organizations: {
      createOrganizationInvitation: jest.fn(),
      getOrganization: jest.fn(),
    },
    users: {
      getUser: jest.fn(),
    },
  },
}));

describe('UserController', () => {
  let userController: UserController;
  let mockRemoveUserUseCase: jest.Mocked<RemoveUserUseCase>;
  let mockUpdateUserRoleUseCase: jest.Mocked<UpdateUserRoleUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  const mockGetAuth = getAuth as jest.Mock;
  const mockCreateOrganizationInvitation = clerkClient.organizations
    .createOrganizationInvitation as jest.Mock;
  const mockGetOrganization = clerkClient.organizations.getOrganization as jest.Mock;
  const mockGetUser = clerkClient.users.getUser as jest.Mock;

  // Import the mocked email service
  const { sendInvitationEmail } = require('@/utils/emailService');
  const mockSendInvitationEmail = sendInvitationEmail as jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();

    // Mocks for use cases, even if not all are used in 'create' tests
    mockRemoveUserUseCase = {
      execute: jest.fn(),
    };
    mockUpdateUserRoleUseCase = {
      execute: jest.fn(),
    };

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    userController = new UserController(mockRemoveUserUseCase, mockUpdateUserRoleUseCase);
  });

  describe('create', () => {
    const invitationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      organizationId: 'org_123',
      role: 'basic_member',
    };

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.body = invitationData;
      mockGetAuth.mockReturnValue({ userId: null });

      await userController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Non autorisé',
        message: 'Utilisateur non authentifié',
      });
    });

    it('should create an organization invitation successfully', async () => {
      mockRequest.body = invitationData;
      mockGetAuth.mockReturnValue({ userId: 'user_abc' });
      const mockInvitation = {
        id: 'inv_456',
        emailAddress: invitationData.email,
        status: 'pending',
      };
      mockCreateOrganizationInvitation.mockResolvedValue(mockInvitation);

      // Mock des données d'organisation et utilisateur
      mockGetOrganization.mockResolvedValue({ name: 'Test Organization' });
      mockGetUser.mockResolvedValue({
        emailAddresses: [{ emailAddress: 'inviter@example.com' }],
      });
      mockSendInvitationEmail.mockResolvedValue(undefined);

      await userController.create(mockRequest as Request, mockResponse as Response);

      expect(mockCreateOrganizationInvitation).toHaveBeenCalledWith({
        organizationId: invitationData.organizationId,
        emailAddress: invitationData.email,
        role: invitationData.role,
        publicMetadata: {
          firstName: invitationData.firstName,
          lastName: invitationData.lastName,
        },
        redirectUrl: expect.any(String),
      });

      // Vérifier que l'email a été envoyé
      expect(mockSendInvitationEmail).toHaveBeenCalledWith({
        recipientEmail: invitationData.email,
        organizationName: 'Test Organization',
        role: invitationData.role,
        inviterEmail: 'inviter@example.com',
        invitationId: mockInvitation.id,
        organizationId: invitationData.organizationId,
      });

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Invitation envoyée avec succès',
        invitation: {
          id: mockInvitation.id,
          emailAddress: mockInvitation.emailAddress,
          status: mockInvitation.status,
        },
      });
    });

    it('should handle Clerk errors during invitation creation', async () => {
      mockRequest.body = invitationData;
      mockGetAuth.mockReturnValue({ userId: 'user_abc' });
      const clerkError = {
        message: 'Clerk error message',
        errors: [{ code: 'some_error_code', message: 'details' }],
      };
      mockCreateOrganizationInvitation.mockRejectedValue(clerkError);

      await userController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la création de l\'invitation",
        message: clerkError.message,
        details: clerkError.errors,
      });
    });

    it('should handle generic errors during invitation creation', async () => {
      mockRequest.body = invitationData;
      mockGetAuth.mockReturnValue({ userId: 'user_abc' });
      const genericError = new Error('Something went wrong');
      mockCreateOrganizationInvitation.mockRejectedValue(genericError);

      await userController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la création de l\'invitation",
        message: genericError.message,
      });
    });

    it('should handle unknown (non-Error) errors during invitation creation', async () => {
      mockRequest.body = invitationData;
      mockGetAuth.mockReturnValue({ userId: 'user_abc' });
      const unknownError = 'a string error';
      mockCreateOrganizationInvitation.mockRejectedValue(unknownError);

      await userController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la création de l\'invitation",
        message: 'Erreur inconnue',
      });
    });

    it('should create invitation successfully even if email fails', async () => {
      mockRequest.body = invitationData;
      mockGetAuth.mockReturnValue({ userId: 'user_abc' });
      const mockInvitation = {
        id: 'inv_456',
        emailAddress: invitationData.email,
        status: 'pending',
      };
      mockCreateOrganizationInvitation.mockResolvedValue(mockInvitation);

      // Mock successful organization and user fetch
      mockGetOrganization.mockResolvedValue({ name: 'Test Organization' });
      mockGetUser.mockResolvedValue({
        emailAddresses: [{ emailAddress: 'inviter@example.com' }],
      });

      // Mock email service to fail
      mockSendInvitationEmail.mockRejectedValue(new Error('Email service unavailable'));

      await userController.create(mockRequest as Request, mockResponse as Response);

      // L'invitation doit quand même être créée avec succès
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Invitation envoyée avec succès',
        invitation: {
          id: mockInvitation.id,
          emailAddress: mockInvitation.emailAddress,
          status: mockInvitation.status,
        },
      });
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      mockRequest = {
        params: { userId: 'user_123' },
        body: { organizationId: 'org_123' },
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should remove user successfully', async () => {
      const expectedResult = { success: true, message: 'User removed successfully' };
      mockRemoveUserUseCase.execute.mockResolvedValue(expectedResult);

      await userController.remove(mockRequest as Request, mockResponse as Response);

      expect(mockRemoveUserUseCase.execute).toHaveBeenCalledWith('user_123', 'org_123');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should return 400 when userId is missing', async () => {
      mockRequest.params = {};

      await userController.remove(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Paramètres manquants',
        message: 'userId et organizationId sont requis',
      });
      expect(mockRemoveUserUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when organizationId is missing', async () => {
      mockRequest.body = {};

      await userController.remove(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Paramètres manquants',
        message: 'userId et organizationId sont requis',
      });
      expect(mockRemoveUserUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when use case returns failure', async () => {
      const expectedResult = { success: false, message: 'Removal failed' };
      mockRemoveUserUseCase.execute.mockResolvedValue(expectedResult);

      await userController.remove(mockRequest as Request, mockResponse as Response);

      expect(mockRemoveUserUseCase.execute).toHaveBeenCalledWith('user_123', 'org_123');
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should handle error when use case throws an error', async () => {
      const error = new Error('Use case error');
      mockRemoveUserUseCase.execute.mockRejectedValue(error);

      await userController.remove(mockRequest as Request, mockResponse as Response);

      expect(mockRemoveUserUseCase.execute).toHaveBeenCalledWith('user_123', 'org_123');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur serveur lors de la suppression de l'utilisateur",
        error: 'Use case error',
      });
    });

    it('should handle unknown error types', async () => {
      mockRemoveUserUseCase.execute.mockRejectedValue('String error');

      await userController.remove(mockRequest as Request, mockResponse as Response);

      expect(mockRemoveUserUseCase.execute).toHaveBeenCalledWith('user_123', 'org_123');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur serveur lors de la suppression de l'utilisateur",
        error: 'Erreur inconnue',
      });
    });
  });

  describe('updateRole', () => {
    beforeEach(() => {
      mockRequest = {
        params: { userId: 'user_123' },
        body: { organizationId: 'org_123', role: 'admin' },
      };

      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    it('should update user role successfully', async () => {
      const expectedResult = {
        success: true,
        message: "Rôle de l'utilisateur modifié avec succès vers admin",
      };
      mockUpdateUserRoleUseCase.execute.mockResolvedValue(expectedResult);

      await userController.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockUpdateUserRoleUseCase.execute).toHaveBeenCalledWith(
        'user_123',
        'org_123',
        'admin'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should return 400 when userId is missing', async () => {
      mockRequest.params = {};

      await userController.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Paramètres manquants',
        message: 'userId, organizationId et role sont requis',
      });
      expect(mockUpdateUserRoleUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when organizationId is missing', async () => {
      mockRequest.body = { role: 'admin' };

      await userController.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Paramètres manquants',
        message: 'userId, organizationId et role sont requis',
      });
      expect(mockUpdateUserRoleUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when role is missing', async () => {
      mockRequest.body = { organizationId: 'org_123' };

      await userController.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Paramètres manquants',
        message: 'userId, organizationId et role sont requis',
      });
      expect(mockUpdateUserRoleUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when all required parameters are missing', async () => {
      mockRequest = {
        params: {},
        body: {},
      };

      await userController.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Paramètres manquants',
        message: 'userId, organizationId et role sont requis',
      });
      expect(mockUpdateUserRoleUseCase.execute).not.toHaveBeenCalled();
    });

    it('should return 400 when use case returns failure', async () => {
      const expectedResult = { success: false, message: 'Role update failed' };
      mockUpdateUserRoleUseCase.execute.mockResolvedValue(expectedResult);

      await userController.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockUpdateUserRoleUseCase.execute).toHaveBeenCalledWith(
        'user_123',
        'org_123',
        'admin'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
    });

    it('should handle error when use case throws an error', async () => {
      const error = new Error('Use case error');
      mockUpdateUserRoleUseCase.execute.mockRejectedValue(error);

      await userController.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockUpdateUserRoleUseCase.execute).toHaveBeenCalledWith(
        'user_123',
        'org_123',
        'admin'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur serveur lors de la modification du rôle de l'utilisateur",
        error: 'Use case error',
      });
    });

    it('should handle unknown error types', async () => {
      mockUpdateUserRoleUseCase.execute.mockRejectedValue('String error');

      await userController.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockUpdateUserRoleUseCase.execute).toHaveBeenCalledWith(
        'user_123',
        'org_123',
        'admin'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Erreur serveur lors de la modification du rôle de l'utilisateur",
        error: 'Erreur inconnue',
      });
    });

    it('should test different role values', async () => {
      const roles = ['member', 'viewer', 'editor', 'manager'];

      for (const role of roles) {
        mockRequest.body = { organizationId: 'org_123', role };
        const expectedResult = {
          success: true,
          message: `Rôle de l'utilisateur modifié avec succès vers ${role}`,
        };
        mockUpdateUserRoleUseCase.execute.mockResolvedValue(expectedResult);

        await userController.updateRole(mockRequest as Request, mockResponse as Response);

        expect(mockUpdateUserRoleUseCase.execute).toHaveBeenCalledWith('user_123', 'org_123', role);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedResult);
      }
    });

    it('should handle empty string parameters', async () => {
      mockRequest = {
        params: { userId: '' },
        body: { organizationId: '', role: '' },
      };

      await userController.updateRole(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Paramètres manquants',
        message: 'userId, organizationId et role sont requis',
      });
      expect(mockUpdateUserRoleUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
