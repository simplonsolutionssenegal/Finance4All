import { BeneficiaryController } from '@/infrastructure/web/controllers/BeneficiaryController';
import type { CreateBeneficiaryUseCase } from '@/application/use-cases/CreateBeneficiaryUseCase';
import type { Request, Response, NextFunction } from 'express';
import { User } from '@/domain/entities/User';

describe('BeneficiaryController', () => {
  let controller: BeneficiaryController;
  let mockCreateBeneficiaryUseCase: jest.Mocked<CreateBeneficiaryUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockCreateBeneficiaryUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<CreateBeneficiaryUseCase>;

    controller = new BeneficiaryController(mockCreateBeneficiaryUseCase);

    mockRequest = {
      body: {
        clerkUserId: 'clerk_123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phoneNumber: '+221771234567',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a beneficiary successfully', async () => {
      // Arrange
      const expectedUser = new User(
        'clerk_123',
        'John Doe',
        'john.doe@example.com',
        'beneficiary',
        '+221771234567'
      );
      mockCreateBeneficiaryUseCase.execute.mockResolvedValue(expectedUser);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockCreateBeneficiaryUseCase.execute).toHaveBeenCalledWith(
        'clerk_123',
        'John Doe',
        'john.doe@example.com',
        '+221771234567'
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 'clerk_123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+221771234567',
          role: 'beneficiary',
        },
        message: 'Bénéficiaire créé avec succès',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle use case error', async () => {
      // Arrange
      const error = new Error('Email already exists');
      mockCreateBeneficiaryUseCase.execute.mockRejectedValue(error);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockCreateBeneficiaryUseCase.execute).toHaveBeenCalledWith(
        'clerk_123',
        'John Doe',
        'john.doe@example.com',
        '+221771234567'
      );
      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should handle missing request body', async () => {
      // Arrange
      mockRequest.body = {};

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockCreateBeneficiaryUseCase.execute).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined
      );
    });

    it('should handle partial request body', async () => {
      // Arrange
      mockRequest.body = {
        clerkUserId: 'clerk_123',
        name: 'John Doe',
        // email and phoneNumber missing
      };

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockCreateBeneficiaryUseCase.execute).toHaveBeenCalledWith(
        'clerk_123',
        'John Doe',
        undefined,
        undefined
      );
    });

    it('should handle use case validation error', async () => {
      // Arrange
      const validationError = new Error(
        "L'ID Clerk, le nom, l'email et le numéro de téléphone sont requis"
      );
      mockCreateBeneficiaryUseCase.execute.mockRejectedValue(validationError);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(validationError);
    });

    it('should handle use case email format error', async () => {
      // Arrange
      const emailError = new Error("Format d'email invalide");
      mockCreateBeneficiaryUseCase.execute.mockRejectedValue(emailError);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(emailError);
    });

    it('should handle unexpected error', async () => {
      // Arrange
      const unexpectedError = new Error('Unexpected database error');
      mockCreateBeneficiaryUseCase.execute.mockRejectedValue(unexpectedError);

      // Act
      await controller.create(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(unexpectedError);
    });
  });
});
