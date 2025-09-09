import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { Request, Response } from 'express';

// Import des modules à tester
import { ForgotPasswordUseCaseImpl } from '../domain/use-cases/ForgotPasswordUseCaseImpl';
import { ForgotPasswordController } from '../infrastructure/web/controllers/ForgotPasswordController';
import forgotPasswordRoutes from '../infrastructure/web/routes/forgot-password.routes';
import { clerkClient } from '@clerk/express';
import { errorMiddleware } from '../infrastructure/web/middleware/error.middleware';

// Mock de Clerk
jest.mock('@clerk/express', () => ({
  clerkClient: {
    users: {
      getUserList: jest.fn(),
      createUser: jest.fn(),
    },
  },
}));


describe('Forgot Password - Complete Functionality', () => {
  let mockClerkClient: jest.Mocked<typeof clerkClient>;
  let app: express.Application;

  const setupExpressApp = () => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth/forgot-password', forgotPasswordRoutes);
    app.use(errorMiddleware);
  };

  const setupClerkMock = () => {
    mockClerkClient = clerkClient as jest.Mocked<typeof clerkClient>;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupExpressApp();
    setupClerkMock();
  });

  describe('ForgotPasswordUseCaseImpl', () => {
    let useCase: ForgotPasswordUseCaseImpl;

    beforeEach(() => {
      useCase = new ForgotPasswordUseCaseImpl();
    });

    describe('Email validation', () => {
      it('should accept valid email format', async () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org',
          'user123@test-domain.com',
        ];

        for (const email of validEmails) {
          mockClerkClient.users.getUserList.mockResolvedValue({
            data: [{ id: '1', emailAddresses: [{ emailAddress: email }] }],
            totalCount: 1,
          } as any);

          const result = await useCase.execute(email);
          expect(result.success).toBe(true);
        }
      });

      it('should reject invalid email format', async () => {
        const invalidEmails = [
          'invalid-email',
          '@example.com',
          'user@',
          'user..name@example.com',
          'user@.com',
          'user@example.',
          '',
          '   ',
          null,
          undefined,
        ];

        for (const email of invalidEmails) {
          await expect(useCase.execute(email as any)).rejects.toThrow();
        }
      });

      it('should reject emails with multiple @ symbols', async () => {
        const emailsWithMultipleAt = [
          'user@@example.com',
          'user@example@com',
          '@@example.com',
        ];

        for (const email of emailsWithMultipleAt) {
          await expect(useCase.execute(email)).rejects.toThrow('Format d\'email invalide');
        }
      });

      it('should reject emails with local part starting or ending with dots', async () => {
        const emailsWithDotsInLocal = [
          '.user@example.com',
          'user.@example.com',
          '.user.@example.com',
        ];

        for (const email of emailsWithDotsInLocal) {
          await expect(useCase.execute(email)).rejects.toThrow('Format d\'email invalide');
        }
      });

      it('should reject emails with consecutive dots in local part', async () => {
        const emailsWithConsecutiveDots = [
          'user..name@example.com',
          'user...name@example.com',
        ];

        for (const email of emailsWithConsecutiveDots) {
          await expect(useCase.execute(email)).rejects.toThrow('Format d\'email invalide');
        }
      });

      it('should reject emails with domain part starting or ending with dots', async () => {
        const emailsWithDotsInDomain = [
          'user@.example.com',
          'user@example.com.',
          'user@.example.com.',
        ];

        for (const email of emailsWithDotsInDomain) {
          await expect(useCase.execute(email)).rejects.toThrow('Format d\'email invalide');
        }
      });

      it('should reject emails with consecutive dots in domain part', async () => {
        const emailsWithConsecutiveDotsInDomain = [
          'user@example..com',
          'user@example...com',
        ];

        for (const email of emailsWithConsecutiveDotsInDomain) {
          await expect(useCase.execute(email)).rejects.toThrow('Format d\'email invalide');
        }
      });

      it('should reject emails with TLD shorter than 2 characters', async () => {
        const emailsWithShortTld = [
          'user@example.c',
          'user@example.',
        ];

        for (const email of emailsWithShortTld) {
          await expect(useCase.execute(email)).rejects.toThrow('Format d\'email invalide');
        }
      });

      it('should reject emails shorter than 5 characters', async () => {
        const shortEmails = [
          'a@b',
          'ab@c',
          'abc@d',
        ];

        for (const email of shortEmails) {
          await expect(useCase.execute(email)).rejects.toThrow('Format d\'email invalide');
        }
      });

      it('should reject emails with domain without dots', async () => {
        const emailsWithoutDotsInDomain = [
          'user@example',
          'user@domain',
        ];

        for (const email of emailsWithoutDotsInDomain) {
          await expect(useCase.execute(email)).rejects.toThrow('Format d\'email invalide');
        }
      });

      it('should reject empty or whitespace email', async () => {
        const emptyEmails = ['', '   ', '\t', '\n'];

        for (const email of emptyEmails) {
          await expect(useCase.execute(email)).rejects.toThrow('L\'email est requis');
        }
      });
    });

    describe('User existence check', () => {
      it('should return success when user exists', async () => {
        const email = 'existing@example.com';
        mockClerkClient.users.getUserList.mockResolvedValue({
          data: [{ id: '1', emailAddresses: [{ emailAddress: email }] }],
          totalCount: 1,
        } as any);

        const result = await useCase.execute(email);
        expect(result.success).toBe(true);
        expect(result.message).toContain('lien de réinitialisation');
      });

      it('should throw error when user does not exist', async () => {
        const email = 'nonexistent@example.com';
        mockClerkClient.users.getUserList.mockResolvedValue({
          data: [],
          totalCount: 0,
        } as any);

        await expect(useCase.execute(email)).rejects.toThrow('Aucun compte n\'est associé à cette adresse email');
      });
    });

    describe('Clerk configuration and error handling', () => {
      it('should handle Clerk API errors gracefully', async () => {
        const email = 'test@example.com';
        const errorCases = [
          { error: 'unauthorized access', expectedMessage: 'Une erreur est survenue lors de l\'envoi du lien de réinitialisation.' },
          { error: '403 forbidden', expectedMessage: 'Vous n\'avez pas les permissions pour envoyer un lien de réinitialisation.' },
          { error: 'rate limit exceeded', expectedMessage: 'Trop de tentatives. Veuillez réessayer plus tard.' },
          { error: 'already sent recently', expectedMessage: 'Un lien de réinitialisation a déjà été envoyé récemment. Veuillez vérifier votre boîte email ou réessayer plus tard' },
        ];

        for (const testCase of errorCases) {
          mockClerkClient.users.getUserList.mockRejectedValue(new Error(testCase.error));
          await expect(useCase.execute(email)).rejects.toThrow(testCase.expectedMessage);
        }
      });

      it('should handle unknown Clerk errors', async () => {
        const email = 'test@example.com';
        mockClerkClient.users.getUserList.mockRejectedValue(new Error('Unknown Clerk error'));

        await expect(useCase.execute(email)).rejects.toThrow('Unknown Clerk error');
      });

      it('should handle non-Error exceptions', async () => {
        const email = 'test@example.com';
        mockClerkClient.users.getUserList.mockRejectedValue('String error');

        await expect(useCase.execute(email)).rejects.toThrow('Erreur inconnue lors de l\'envoi du lien de réinitialisation');
      });
    });

    describe('Error mapping tests', () => {
      it('should map specific error messages correctly', async () => {
        const email = 'test@example.com';
        const errorMappings = [
          { error: 'Aucun compte n\'est associé à cette adresse email', expected: 'Aucun compte n\'est associé à cette adresse email' },
          { error: 'User not found', expected: 'Aucun compte n\'est associé à cette adresse email' },
          { error: 'User does not exist', expected: 'Aucun compte n\'est associé à cette adresse email' },
          { error: 'Rate limit exceeded', expected: 'Trop de tentatives. Veuillez réessayer plus tard.' },
          { error: 'Reset link already exists', expected: 'Un lien de réinitialisation a déjà été envoyé récemment. Veuillez vérifier votre boîte email ou réessayer plus tard' },
          { error: 'Reset link already sent', expected: 'Un lien de réinitialisation a déjà été envoyé récemment. Veuillez vérifier votre boîte email ou réessayer plus tard' },
          { error: 'Unauthorized access', expected: 'Une erreur est survenue lors de l\'envoi du lien de réinitialisation.' },
          { error: '401 Unauthorized', expected: 'Une erreur est survenue lors de l\'envoi du lien de réinitialisation.' },
          { error: 'Forbidden access', expected: 'Vous n\'avez pas les permissions pour envoyer un lien de réinitialisation.' },
          { error: '403 Forbidden', expected: 'Vous n\'avez pas les permissions pour envoyer un lien de réinitialisation.' },
        ];

        for (const mapping of errorMappings) {
          mockClerkClient.users.getUserList.mockRejectedValue(new Error(mapping.error));
          await expect(useCase.execute(email)).rejects.toThrow(mapping.expected);
        }
      });
    });
  });

  describe('ForgotPasswordController', () => {
    let controller: ForgotPasswordController;
    let mockUseCase: jest.Mocked<ForgotPasswordUseCaseImpl>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    const setupControllerMocks = () => {
      mockUseCase = {
        execute: jest.fn(),
      } as unknown as jest.Mocked<ForgotPasswordUseCaseImpl>;

      mockJson = jest.fn();
      mockStatus = jest.fn().mockReturnValue({ json: mockJson });

      mockRequest = { body: {} };
      mockResponse = { 
        status: mockStatus as any, 
        json: mockJson as any 
      };

      controller = new ForgotPasswordController(mockUseCase);
    };

    beforeEach(() => {
      setupControllerMocks();
    });

    it('should return success response when use case succeeds', async () => {
      const email = 'test@example.com';
      const useCaseResult = {
        success: true,
        message: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
      };

      mockRequest.body = { email };
      mockUseCase.execute.mockResolvedValue(useCaseResult);

      await controller.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(mockUseCase.execute).toHaveBeenCalledWith(email);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'success',
        message: useCaseResult.message,
        data: { success: useCaseResult.success },
      });
    });

    it('should return error response when use case throws error', async () => {
      const email = 'invalid@example.com';
      const errorMessage = 'Format d\'email invalide';

      mockRequest.body = { email };
      mockUseCase.execute.mockRejectedValue(new Error(errorMessage));

      await controller.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(mockUseCase.execute).toHaveBeenCalledWith(email);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: errorMessage,
        data: { success: false },
      });
    });

    it('should handle missing email in request body', async () => {
      mockRequest.body = {};
      mockUseCase.execute.mockRejectedValue(new Error('L\'email est requis'));

      await controller.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(mockUseCase.execute).toHaveBeenCalledWith(undefined as any);
      expect(mockStatus).toHaveBeenCalledWith(400);
    });

    it('should handle non-Error exceptions', async () => {
      const email = 'test@example.com';
      mockRequest.body = { email };
      mockUseCase.execute.mockRejectedValue('String error');

      await controller.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        status: 'error',
        message: 'Erreur inconnue',
        data: { success: false },
      });
    });
  });

  describe('Forgot Password Routes', () => {
    it('should return success response for valid email', async () => {
      const email = 'test@example.com';
      mockClerkClient.users.getUserList.mockResolvedValue({
        data: [{ id: '1', emailAddresses: [{ emailAddress: email }] }],
        totalCount: 1,
      } as any);

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: expect.stringContaining('lien de réinitialisation'),
        data: { success: true },
      });
    });

    it('should return error response for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'L\'email est requis',
        data: { success: false },
      });
    });

    it('should return error response for invalid email format', async () => {
      const invalidEmail = 'invalid-email';

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: invalidEmail })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Format d\'email invalide',
        data: { success: false },
      });
    });

    it('should return error response when user is not found', async () => {
      const email = 'nonexistent@example.com';
      mockClerkClient.users.getUserList.mockResolvedValue({
        data: [],
        totalCount: 0,
      } as any);

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Aucun compte n\'est associé à cette adresse email',
        data: { success: false },
      });
    });

    it('should return error response for rate limit error', async () => {
      const email = 'test@example.com';
      mockClerkClient.users.getUserList.mockRejectedValue(new Error('rate limit exceeded'));

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Trop de tentatives. Veuillez réessayer plus tard.',
        data: { success: false },
      });
    });

    it('should return error response for already sent error', async () => {
      const email = 'test@example.com';
      mockClerkClient.users.getUserList.mockRejectedValue(new Error('already sent recently'));

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Un lien de réinitialisation a déjà été envoyé récemment. Veuillez vérifier votre boîte email ou réessayer plus tard',
        data: { success: false },
      });
    });

    it('should return error response for Clerk configuration error', async () => {
      const email = 'test@example.com';
      mockClerkClient.users.getUserList.mockRejectedValue(new Error('unauthorized access'));

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Une erreur est survenue lors de l\'envoi du lien de réinitialisation.',
        data: { success: false },
      });
    });

    it('should return error response for Clerk access denied error', async () => {
      const email = 'test@example.com';
      mockClerkClient.users.getUserList.mockRejectedValue(new Error('403 forbidden'));

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Vous n\'avez pas les permissions pour envoyer un lien de réinitialisation.',
        data: { success: false },
      });
    });

    it('should return error response for unknown error', async () => {
      const email = 'test@example.com';
      mockClerkClient.users.getUserList.mockRejectedValue(new Error('Unknown Clerk error'));

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Unknown Clerk error',
        data: { success: false },
      });
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toBeDefined();
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send()
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'L\'email est requis',
        data: { success: false },
      });
    });

    it('should handle null email in request', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: null })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'L\'email est requis',
        data: { success: false },
      });
    });

    it('should handle empty string email in request', async () => {
      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: '' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'L\'email est requis',
        data: { success: false },
      });
    });

    it('should handle extra fields in request body', async () => {
      const email = 'test@example.com';
      mockClerkClient.users.getUserList.mockResolvedValue({
        data: [{ id: '1', emailAddresses: [{ emailAddress: email }] }],
        totalCount: 1,
      } as any);

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ 
          email, 
          extraField: 'should be ignored',
          anotherField: 123 
        })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: expect.stringContaining('lien de réinitialisation'),
        data: { success: true },
      });
    });
  });
});
