// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { UserController } from '../infrastructure/web/controllers/UserController';
import { CreateUserUseCase } from '../application/use-cases/CreateUserUseCase';
import { User } from '../domain/entities/User';

describe('UserController', () => {
  let userController: UserController;
  let mockCreateUserUseCase: jest.Mocked<CreateUserUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Mock du use case
    mockCreateUserUseCase = {
      execute: jest.fn(),
    } as any;

    // Mock de la réponse Express
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Instance du contrôleur
    userController = new UserController(mockCreateUserUseCase);
  });

  describe('create', () => {
    it('should create user successfully and return 201 status', async () => {
      // Arrange
      const userData = { name: 'John Doe', email: 'john@example.com' };
      const createdUser = new User('1', userData.name, userData.email);
      
      mockRequest = {
        body: userData,
      };

      mockCreateUserUseCase.execute.mockResolvedValue(createdUser);

      // Act
      await userController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(userData.name, userData.email);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdUser);
    });

    it('should handle validation errors and return 400 status', async () => {
      // Arrange
      const userData = { name: '', email: 'invalid-email' };
      const errorMessage = 'Nom et email requis';
      
      mockRequest = {
        body: userData,
      };

      mockCreateUserUseCase.execute.mockRejectedValue(new Error(errorMessage));

      // Act
      await userController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(userData.name, userData.email);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la création de l\'utilisateur',
        message: errorMessage,
      });
    });

    it('should handle unknown errors and return 400 status with generic message', async () => {
      // Arrange
      const userData = { name: 'John Doe', email: 'john@example.com' };
      
      mockRequest = {
        body: userData,
      };

      // Simuler une erreur qui n'est pas une instance d'Error
      mockCreateUserUseCase.execute.mockRejectedValue('Unknown error');

      // Act
      await userController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(userData.name, userData.email);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la création de l\'utilisateur',
        message: 'Erreur inconnue',
      });
    });

    it('should extract name and email from request body correctly', async () => {
      // Arrange
      const userData = { 
        name: 'Jane Doe', 
        email: 'jane@example.com',
        extraField: 'should be ignored' // Champ supplémentaire qui devrait être ignoré
      };
      const createdUser = new User('2', userData.name, userData.email);
      
      mockRequest = {
        body: userData,
      };

      mockCreateUserUseCase.execute.mockResolvedValue(createdUser);

      // Act
      await userController.create(mockRequest as Request, mockResponse as Response);

      // Assert - Vérifier que seuls name et email sont extraits
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(userData.name, userData.email);
      expect(mockCreateUserUseCase.execute).not.toHaveBeenCalledWith(
        expect.objectContaining({ extraField: 'should be ignored' })
      );
    });

    it('should handle missing request body fields gracefully', async () => {
      // Arrange
      const userData = {}; // Corps de requête vide
      
      mockRequest = {
        body: userData,
      };

      mockCreateUserUseCase.execute.mockRejectedValue(new Error('Name and email are required'));

      // Act
      await userController.create(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockCreateUserUseCase.execute).toHaveBeenCalledWith(undefined, undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erreur lors de la création de l\'utilisateur',
        message: 'Name and email are required',
      });
    });
  });

  describe('constructor', () => {
    it('should inject CreateUserUseCase dependency correctly', () => {
      // Arrange & Act
      const controller = new UserController(mockCreateUserUseCase);

      // Assert
      expect(controller).toBeInstanceOf(UserController);
      expect(controller['createUserUseCase']).toBe(mockCreateUserUseCase);
    });
  });
});
