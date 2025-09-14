import { Request, Response } from 'express';
import { UserController } from '@/infrastructure/web/controllers/UserController';
import { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import { RemoveUserUseCase } from '@/application/use-cases/RemoveUserUseCase';
import { UpdateUserRoleUseCase } from '@/application/use-cases/UpdateUserRoleUseCase';

describe('UserController - remove method', () => {
  let userController: UserController;
  let mockCreateUserUseCase: jest.Mocked<CreateUserUseCase>;
  let mockRemoveUserUseCase: jest.Mocked<RemoveUserUseCase>;
  let mockUpdateUserRoleUseCase: jest.Mocked<UpdateUserRoleUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockCreateUserUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<CreateUserUseCase>;

    mockRemoveUserUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<RemoveUserUseCase>;

    mockUpdateUserRoleUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<UpdateUserRoleUseCase>;

    userController = new UserController(mockCreateUserUseCase, mockRemoveUserUseCase, mockUpdateUserRoleUseCase);

    mockRequest = {
      params: { userId: 'user_123' },
      body: { organizationId: 'org_123' },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('remove', () => {
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
        message: 'Erreur serveur lors de la suppression de l\'utilisateur',
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
        message: 'Erreur serveur lors de la suppression de l\'utilisateur',
        error: 'Erreur inconnue',
      });
    });
  });
});