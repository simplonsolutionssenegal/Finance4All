import { Request, Response } from 'express';

import { AuthController } from '@/infrastructure/web/controllers/AuthController';
import { ClerkService } from '@/infrastructure/services/ClerkService';

// Mock ClerkService
jest.mock('@/infrastructure/services/ClerkService');

describe('AuthController', () => {
  let authController: AuthController;
  let mockClerkService: jest.Mocked<ClerkService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock ClerkService
    mockClerkService = {
      finalizeRegistration: jest.fn(),
      getUserById: jest.fn(),
    } as any;

    // Mock the ClerkService constructor
    (ClerkService as jest.MockedClass<typeof ClerkService>).mockImplementation(() => mockClerkService);

    // Create AuthController instance
    authController = new AuthController();

    // Create mock request and response
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('register', () => {
    it('should successfully register a user with valid data', async () => {
      const requestBody = {
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        organisationId: 'org_123',
      };

      const mockUser = {
        id: 'clerk_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        emailVerified: true,
      };

      mockRequest.body = requestBody;
      mockClerkService.finalizeRegistration.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockClerkService.finalizeRegistration).toHaveBeenCalledWith('clerk_123', {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        organisationId: 'org_123',
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should handle missing clerkUserId', async () => {
      const requestBody = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRequest.body = requestBody;

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Format de requête invalide' },
      });

      expect(mockClerkService.finalizeRegistration).not.toHaveBeenCalled();
    });

    it('should handle missing email', async () => {
      const requestBody = {
        clerkUserId: 'clerk_123',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRequest.body = requestBody;

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Format de requête invalide' },
      });

      expect(mockClerkService.finalizeRegistration).not.toHaveBeenCalled();
    });

    it('should handle invalid request body format', async () => {
      mockRequest.body = 'invalid body';

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Format de requête invalide' },
      });

      expect(mockClerkService.finalizeRegistration).not.toHaveBeenCalled();
    });

    it('should handle null request body', async () => {
      mockRequest.body = null;

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Format de requête invalide' },
      });

      expect(mockClerkService.finalizeRegistration).not.toHaveBeenCalled();
    });

    it('should handle request with invalid field types', async () => {
      const requestBody = {
        clerkUserId: 123, // Should be string
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRequest.body = requestBody;

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Format de requête invalide' },
      });

      expect(mockClerkService.finalizeRegistration).not.toHaveBeenCalled();
    });

    it('should handle optional fields correctly', async () => {
      const requestBody = {
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        // firstName and lastName are optional
        // organisationId is optional
      };

      const mockUser = {
        id: 'clerk_123',
        email: 'test@example.com',
        firstName: '',
        lastName: '',
        emailVerified: true,
      };

      mockRequest.body = requestBody;
      mockClerkService.finalizeRegistration.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockClerkService.finalizeRegistration).toHaveBeenCalledWith('clerk_123', {
        email: 'test@example.com',
        firstName: '',
        lastName: '',
        organisationId: undefined,
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should handle ClerkService error', async () => {
      const requestBody = {
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRequest.body = requestBody;
      mockClerkService.finalizeRegistration.mockRejectedValue(
        new Error('Clerk service error')
      );

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Clerk service error' },
      });
    });

    it('should handle unknown error type', async () => {
      const requestBody = {
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockRequest.body = requestBody;
      mockClerkService.finalizeRegistration.mockRejectedValue('Unknown error');

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Erreur lors de la finalisation' },
      });
    });

    it('should handle empty string values correctly', async () => {
      const requestBody = {
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        firstName: '',
        lastName: '',
        organisationId: '',
      };

      const mockUser = {
        id: 'clerk_123',
        email: 'test@example.com',
        firstName: '',
        lastName: '',
        emailVerified: true,
      };

      mockRequest.body = requestBody;
      mockClerkService.finalizeRegistration.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockClerkService.finalizeRegistration).toHaveBeenCalledWith('clerk_123', {
        email: 'test@example.com',
        firstName: '',
        lastName: '',
        organisationId: '',
      });

      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should validate firstName type correctly', async () => {
      const requestBody = {
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        firstName: 123, // Invalid type
        lastName: 'Doe',
      };

      mockRequest.body = requestBody;

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Format de requête invalide' },
      });
    });

    it('should validate lastName type correctly', async () => {
      const requestBody = {
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: null, // Invalid type
      };

      mockRequest.body = requestBody;

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Format de requête invalide' },
      });
    });

    it('should validate organisationId type correctly', async () => {
      const requestBody = {
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        organisationId: 123, // Invalid type
      };

      mockRequest.body = requestBody;

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Format de requête invalide' },
      });
    });
  });

  describe('isValidFinalizeRegistrationRequest', () => {
    it('should validate correct request format', () => {
      const validRequest = {
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        organisationId: 'org_123',
      };

      // Access private method for testing
      const isValid = (authController as any).isValidFinalizeRegistrationRequest(validRequest);
      expect(isValid).toBe(true);
    });

    it('should reject request with missing required fields', () => {
      const invalidRequest = {
        email: 'test@example.com',
        // Missing clerkUserId
      };

      const isValid = (authController as any).isValidFinalizeRegistrationRequest(invalidRequest);
      expect(isValid).toBe(false);
    });

    it('should accept request with only required fields', () => {
      const validRequest = {
        clerkUserId: 'clerk_123',
        email: 'test@example.com',
      };

      const isValid = (authController as any).isValidFinalizeRegistrationRequest(validRequest);
      expect(isValid).toBe(true);
    });
  });
});
