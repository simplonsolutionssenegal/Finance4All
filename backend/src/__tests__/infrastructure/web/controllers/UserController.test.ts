import { Request, Response } from 'express';
import { UserController } from '@/infrastructure/web/controllers/UserController';
import { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import { User, UserRole, UserStatus } from '@/domain/entities/User';

describe('UserController', () => {
  let userController: UserController;
  let mockCreateUserUseCase: jest.Mocked<CreateUserUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockCreateUserUseCase = {
      execute: jest.fn(),
    };

    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    userController = new UserController(mockCreateUserUseCase);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const createdUser = new User(
        1,
        'john@example.com',
        '',
        'John',
        'Doe',
        UserStatus.ACTIF,
        true,
        new Date(),
        new Date(),
        new Date(),
        UserRole.BENEFICIAIRE
      );

      mockRequest.body = userData;
      mockCreateUserUseCase.execute.mockResolvedValue(createdUser);

      await userController.create(mockRequest as Request, mockResponse as Response);

      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith('John Doe', 'john@example.com');
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdUser);
    });

    it('should handle error when use case throws an error', async () => {
      const userData = { name: 'John Doe', email: 'invalid-email' };
      const error = new Error('Invalid email format');

      mockRequest.body = userData;
      mockCreateUserUseCase.execute.mockRejectedValue(error);

      await userController.create(mockRequest as Request, mockResponse as Response);

      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith('John Doe', 'invalid-email');
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la création de l'utilisateur",
        message: 'Invalid email format',
      });
    });

    it('should handle unknown error types', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const unknownError = 'Something went wrong';

      mockRequest.body = userData;
      mockCreateUserUseCase.execute.mockRejectedValue(unknownError);

      await userController.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors de la création de l'utilisateur",
        message: 'Erreur inconnue',
      });
    });

    it('should handle missing request body data', async () => {
      mockRequest.body = {};
      mockCreateUserUseCase.execute.mockResolvedValue(
        new User(
          1,
          '',
          '',
          '',
          '',
          UserStatus.EN_ATTENTE,
          false,
          new Date(),
          new Date(),
          new Date(),
          UserRole.BENEFICIAIRE
        )
      );

      await userController.create(mockRequest as Request, mockResponse as Response);

      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(undefined, undefined);
    });
  });
});
