import { Request, Response } from 'express';
import { RoleController } from '../infrastructure/web/controllers/RoleController';
import { GetAllRolesUseCase } from '../application/use-cases/GetAllRolesUseCase';
import { Role } from '../domain/entities/Role';

describe('RoleController', () => {
  let roleController: RoleController;
  let mockGetAllRolesUseCase: jest.Mocked<GetAllRolesUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Create mocked use case with proper typing
    mockGetAllRolesUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAllRolesUseCase>;

    // Create mocked response methods
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();

    // Create mocked request and response objects
    mockRequest = {};
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    // Create controller instance with mocked dependencies
    roleController = new RoleController(mockGetAllRolesUseCase);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all roles successfully', async () => {
      // Arrange
      const mockRoles: Role[] = [
        new Role('1', 'ADMIN', new Date('2024-01-01'), new Date('2024-01-01')),
        new Role('2', 'USER', new Date('2024-01-02'), new Date('2024-01-02')),
        new Role('3', 'MODERATOR', new Date('2024-01-03'), new Date('2024-01-03')),
      ];

      mockGetAllRolesUseCase.execute.mockResolvedValue(mockRoles);

      // Act
      await roleController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockGetAllRolesUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockGetAllRolesUseCase.execute).toHaveBeenCalledWith();
      expect(mockJson).toHaveBeenCalledTimes(1);
      expect(mockJson).toHaveBeenCalledWith(mockRoles);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should return empty array when no roles exist', async () => {
      // Arrange
      const mockRoles: Role[] = [];
      mockGetAllRolesUseCase.execute.mockResolvedValue(mockRoles);

      // Act
      await roleController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockGetAllRolesUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockJson).toHaveBeenCalledTimes(1);
      expect(mockJson).toHaveBeenCalledWith([]);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should handle use case errors and return 500 status', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      const mockError = new Error(errorMessage);
      mockGetAllRolesUseCase.execute.mockRejectedValue(mockError);

      // Spy on console.error to verify error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await roleController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockGetAllRolesUseCase.execute).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching roles:', mockError);
      expect(mockStatus).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledTimes(1);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Failed to fetch roles',
      });

      // Restore console.error
      consoleSpy.mockRestore();
    });

    it('should handle unexpected errors and return 500 status', async () => {
      // Arrange
      const unexpectedError = 'Unexpected error occurred';
      mockGetAllRolesUseCase.execute.mockRejectedValue(unexpectedError);

      // Spy on console.error to verify error logging
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await roleController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockGetAllRolesUseCase.execute).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching roles:', unexpectedError);
      expect(mockStatus).toHaveBeenCalledTimes(1);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledTimes(1);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Internal server error',
        message: 'Failed to fetch roles',
      });

      // Restore console.error
      consoleSpy.mockRestore();
    });

    it('should handle null response from use case', async () => {
      // Arrange
      mockGetAllRolesUseCase.execute.mockResolvedValue(null as any);

      // Act
      await roleController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockGetAllRolesUseCase.execute).toHaveBeenCalledTimes(1);
      expect(mockJson).toHaveBeenCalledTimes(1);
      expect(mockJson).toHaveBeenCalledWith(null);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should maintain proper response structure for roles with all properties', async () => {
      // Arrange
      const mockRoles: Role[] = [
        new Role(
          'role-1',
          'ADMIN',
          new Date('2024-01-01T10:00:00Z'),
          new Date('2024-01-02T10:00:00Z')
        ),
        new Role(
          'role-2',
          'USER',
          new Date('2024-01-03T10:00:00Z'),
          new Date('2024-01-04T10:00:00Z')
        ),
      ];

      mockGetAllRolesUseCase.execute.mockResolvedValue(mockRoles);

      // Act
      await roleController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith([
        {
          id: 'role-1',
          name: 'ADMIN',
          createdAt: new Date('2024-01-01T10:00:00Z'),
          updatedAt: new Date('2024-01-02T10:00:00Z'),
        },
        {
          id: 'role-2',
          name: 'USER',
          createdAt: new Date('2024-01-03T10:00:00Z'),
          updatedAt: new Date('2024-01-04T10:00:00Z'),
        },
      ]);
    });

    it('should handle roles with optional properties undefined', async () => {
      // Arrange
      const mockRoles: Role[] = [
        new Role('role-1', 'ADMIN'), // No createdAt and updatedAt
        new Role('role-2', 'USER', new Date('2024-01-01')), // Only createdAt
      ];

      mockGetAllRolesUseCase.execute.mockResolvedValue(mockRoles);

      // Act
      await roleController.getAll(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockJson).toHaveBeenCalledWith([
        {
          id: 'role-1',
          name: 'ADMIN',
          createdAt: undefined,
          updatedAt: undefined,
        },
        {
          id: 'role-2',
          name: 'USER',
          createdAt: new Date('2024-01-01'),
          updatedAt: undefined,
        },
      ]);
    });
  });

  describe('Constructor', () => {
    it('should create instance with GetAllRolesUseCase dependency', () => {
      // Act
      const controller = new RoleController(mockGetAllRolesUseCase);

      // Assert
      expect(controller).toBeInstanceOf(RoleController);
      expect(controller['getAllRolesUseCase']).toBe(mockGetAllRolesUseCase);
    });
  });
});
