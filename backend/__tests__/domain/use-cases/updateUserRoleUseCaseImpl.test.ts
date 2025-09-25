import { UpdateUserRoleUseCaseImpl } from '@/domain/use-cases/updateUserRoleUseCaseImpl';
import { clerkClient } from '@clerk/express';
import { logger } from '@/infrastructure/utils/logger';

// Mock dependencies
jest.mock('@clerk/express', () => ({
  clerkClient: {
    organizations: {
      updateOrganizationMembership: jest.fn(),
    },
  },
}));

jest.mock('@/infrastructure/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockClerkClient = clerkClient as any;
const mockLogger = logger as any;

describe.skip('UpdateUserRoleUseCaseImpl', () => {
  let updateUserRoleUseCase: UpdateUserRoleUseCaseImpl;
  const userId = 'user_123';
  const organizationId = 'org_123';
  const role = 'admin';

  beforeEach(() => {
    jest.clearAllMocks();
    updateUserRoleUseCase = new UpdateUserRoleUseCaseImpl();
  });

  it('should successfully update user role in organization', async () => {
    mockClerkClient.organizations.updateOrganizationMembership.mockResolvedValue({});

    const result = await updateUserRoleUseCase.execute(userId, organizationId, role);

    expect(mockClerkClient.organizations.updateOrganizationMembership).toHaveBeenCalledWith({
      organizationId,
      userId,
      role,
    });
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Début de la modification du rôle de l'utilisateur ${userId} dans l'organisation ${organizationId} vers le rôle ${role}`
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Rôle de l'utilisateur ${userId} modifié avec succès vers ${role} dans l'organisation ${organizationId}`
    );
    expect(result).toEqual({
      success: true,
      message: `Rôle de l'utilisateur modifié avec succès vers ${role}`,
    });
  });

  it('should handle errors when updating user role fails', async () => {
    const error = new Error('Role update failed');
    mockClerkClient.organizations.updateOrganizationMembership.mockRejectedValue(error);

    const result = await updateUserRoleUseCase.execute(userId, organizationId, role);

    expect(mockClerkClient.organizations.updateOrganizationMembership).toHaveBeenCalledWith({
      organizationId,
      userId,
      role,
    });
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Début de la modification du rôle de l'utilisateur ${userId} dans l'organisation ${organizationId} vers le rôle ${role}`
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Erreur lors de la modification du rôle de l'utilisateur",
      {
        userId,
        organizationId,
        role,
        error,
      }
    );
    expect(result).toEqual({
      success: false,
      message: 'Role update failed',
    });
  });

  it('should handle unknown error types', async () => {
    const unknownError = 'String error';
    mockClerkClient.organizations.updateOrganizationMembership.mockRejectedValue(unknownError);

    const result = await updateUserRoleUseCase.execute(userId, organizationId, role);

    expect(mockClerkClient.organizations.updateOrganizationMembership).toHaveBeenCalledWith({
      organizationId,
      userId,
      role,
    });
    expect(mockLogger.error).toHaveBeenCalledWith(
      "Erreur lors de la modification du rôle de l'utilisateur",
      {
        userId,
        organizationId,
        role,
        error: unknownError,
      }
    );
    expect(result).toEqual({
      success: false,
      message: 'Erreur inconnue lors de la modification du rôle',
    });
  });

  it('should handle null/undefined errors', async () => {
    mockClerkClient.organizations.updateOrganizationMembership.mockRejectedValue(null);

    const result = await updateUserRoleUseCase.execute(userId, organizationId, role);

    expect(result).toEqual({
      success: false,
      message: 'Erreur inconnue lors de la modification du rôle',
    });
  });
});
