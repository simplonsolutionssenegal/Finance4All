import { RemoveUserUseCaseImpl } from '@/domain/use-cases/removeUserUseCaseImpl';
import { clerkClient } from '@clerk/express';
import { logger } from '@/utils/logger';

// Mock dependencies
jest.mock('@clerk/express', () => ({
  clerkClient: {
    organizations: {
      deleteOrganizationMembership: jest.fn(),
    },
    users: {
      deleteUser: jest.fn(),
    },
  },
}));

jest.mock('../../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockClerkClient = clerkClient as any;
const mockLogger = logger as any;

describe('RemoveUserUseCaseImpl', () => {
  let removeUserUseCase: RemoveUserUseCaseImpl;
  const userId = 'user_123';
  const organizationId = 'org_123';

  beforeEach(() => {
    jest.clearAllMocks();
    removeUserUseCase = new RemoveUserUseCaseImpl();
  });

  it('should successfully remove user from organization and delete account', async () => {
    mockClerkClient.organizations.deleteOrganizationMembership.mockResolvedValue({});
    mockClerkClient.users.deleteUser.mockResolvedValue({});

    const result = await removeUserUseCase.execute(userId, organizationId);

    expect(mockClerkClient.organizations.deleteOrganizationMembership).toHaveBeenCalledWith({
      organizationId,
      userId,
    });
    expect(mockClerkClient.users.deleteUser).toHaveBeenCalledWith(userId);
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Début de la suppression de l'utilisateur ${userId} de l'organisation ${organizationId}`
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Utilisateur ${userId} supprimé de l'organisation ${organizationId}`
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      `Compte utilisateur ${userId} supprimé définitivement`
    );
    expect(result).toEqual({
      success: true,
      message: 'Utilisateur supprimé avec succès de l\'organisation et son compte a été supprimé',
    });
  });

  it('should continue when organization removal fails but user deletion succeeds', async () => {
    const orgError = new Error('Organization removal failed');
    mockClerkClient.organizations.deleteOrganizationMembership.mockRejectedValue(orgError);
    mockClerkClient.users.deleteUser.mockResolvedValue({});

    const result = await removeUserUseCase.execute(userId, organizationId);

    expect(mockClerkClient.organizations.deleteOrganizationMembership).toHaveBeenCalledWith({
      organizationId,
      userId,
    });
    expect(mockClerkClient.users.deleteUser).toHaveBeenCalledWith(userId);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Erreur lors de la suppression de l\'utilisateur de l\'organisation',
      expect.objectContaining({ userId, organizationId, error: orgError })
    );
    expect(result).toEqual({
      success: true,
      message: 'Utilisateur supprimé avec succès de l\'organisation et son compte a été supprimé',
    });
  });

  it('should return failure when user deletion fails', async () => {
    const userError = new Error('User deletion failed');
    mockClerkClient.organizations.deleteOrganizationMembership.mockResolvedValue({});
    mockClerkClient.users.deleteUser.mockRejectedValue(userError);

    const result = await removeUserUseCase.execute(userId, organizationId);

    expect(mockClerkClient.organizations.deleteOrganizationMembership).toHaveBeenCalledWith({
      organizationId,
      userId,
    });
    expect(mockClerkClient.users.deleteUser).toHaveBeenCalledWith(userId);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Erreur lors de la suppression du compte utilisateur',
      expect.objectContaining({ userId, error: userError })
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Erreur lors de la suppression de l\'utilisateur',
      expect.objectContaining({ userId, organizationId })
    );
    expect(result).toEqual({
      success: false,
      message: 'Impossible de supprimer le compte utilisateur',
    });
  });

  it('should handle unknown error types', async () => {
    mockClerkClient.organizations.deleteOrganizationMembership.mockResolvedValue({});
    mockClerkClient.users.deleteUser.mockRejectedValue('String error');

    const result = await removeUserUseCase.execute(userId, organizationId);

    expect(result).toEqual({
      success: false,
      message: 'Impossible de supprimer le compte utilisateur',
    });
  });

  it('should handle both organization and user deletion failures', async () => {
    const orgError = new Error('Organization removal failed');
    const userError = new Error('User deletion failed');
    mockClerkClient.organizations.deleteOrganizationMembership.mockRejectedValue(orgError);
    mockClerkClient.users.deleteUser.mockRejectedValue(userError);

    const result = await removeUserUseCase.execute(userId, organizationId);

    expect(mockLogger.error).toHaveBeenCalledWith(
      'Erreur lors de la suppression de l\'utilisateur de l\'organisation',
      expect.objectContaining({ userId, organizationId, error: orgError })
    );
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Erreur lors de la suppression du compte utilisateur',
      expect.objectContaining({ userId, error: userError })
    );
    expect(result).toEqual({
      success: false,
      message: 'Impossible de supprimer le compte utilisateur',
    });
  });
});