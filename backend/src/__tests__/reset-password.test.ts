import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { Request, Response } from 'express';

// Import des modules à tester
import { ResetPasswordUseCaseImpl } from '../domain/use-cases/ResetPasswordUseCaseImpl';
import { ResetPasswordController } from '../infrastructure/web/controllers/ResetPasswordController';
import resetPasswordRoutes from '../infrastructure/web/routes/reset-password.routes';
import { clerkClient } from '@clerk/express';
import { errorMiddleware } from '../infrastructure/web/middleware/error.middleware';

// Mock de Clerk
jest.mock('@clerk/express', () => ({
  clerkClient: {
    users: {
      updateUser: jest.fn(),
    },
  },
}));

describe('Reset Password - Complete Functionality', () => {
  let mockClerkClient: jest.Mocked<typeof clerkClient>;
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configuration de l'app Express pour les tests de routes
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth/reset-password', resetPasswordRoutes);
    app.use(errorMiddleware);

    // Mock de Clerk
    mockClerkClient = clerkClient as jest.Mocked<typeof clerkClient>;
  });

  describe('ResetPasswordUseCaseImpl', () => {
    let useCase: ResetPasswordUseCaseImpl;

    beforeEach(() => {
      useCase = new ResetPasswordUseCaseImpl();
    });

    describe('Input validation', () => {
      it('should accept valid userId and password', async () => {
        const userId = 'user_123';
        const newPassword = 'ValidPass123!';

        mockClerkClient.users.updateUser.mockResolvedValue({} as any);

        const result = await useCase.execute(userId, newPassword);
        expect(result.success).toBe(true);
        expect(result.message).toBe('Votre mot de passe a été mis à jour avec succès.');
      });

      it('should reject empty userId', async () => {
        const userId = '';
        const newPassword = 'ValidPass123!';

        await expect(useCase.execute(userId, newPassword)).rejects.toThrow('L\'ID utilisateur est requis');
      });

      it('should reject null userId', async () => {
        const userId = null as any;
        const newPassword = 'ValidPass123!';

        await expect(useCase.execute(userId, newPassword)).rejects.toThrow('L\'ID utilisateur est requis');
      });

      it('should reject undefined userId', async () => {
        const userId = undefined as any;
        const newPassword = 'ValidPass123!';

        await expect(useCase.execute(userId, newPassword)).rejects.toThrow('L\'ID utilisateur est requis');
      });

      it('should reject whitespace-only userId', async () => {
        const userId = '   ';
        const newPassword = 'ValidPass123!';

        await expect(useCase.execute(userId, newPassword)).rejects.toThrow('L\'ID utilisateur est requis');
      });

      it('should reject empty password', async () => {
        const userId = 'user_123';
        const newPassword = '';

        await expect(useCase.execute(userId, newPassword)).rejects.toThrow('Le nouveau mot de passe est requis');
      });

      it('should reject null password', async () => {
        const userId = 'user_123';
        const newPassword = null as any;

        await expect(useCase.execute(userId, newPassword)).rejects.toThrow('Le nouveau mot de passe est requis');
      });

      it('should reject undefined password', async () => {
        const userId = 'user_123';
        const newPassword = undefined as any;

        await expect(useCase.execute(userId, newPassword)).rejects.toThrow('Le nouveau mot de passe est requis');
      });

      it('should reject whitespace-only password', async () => {
        const userId = 'user_123';
        const newPassword = '   ';

        await expect(useCase.execute(userId, newPassword)).rejects.toThrow('Le nouveau mot de passe est requis');
      });
    });

    describe('Password strength validation', () => {
      const validUserId = 'user_123';

      it('should accept strong password with all requirements', async () => {
        const strongPasswords = [
          'ValidPass123!',
          'MySecure@Pass1',
          'Complex#Pass99',
          'Strong$Password2',
        ];

        for (const password of strongPasswords) {
          mockClerkClient.users.updateUser.mockResolvedValue({} as any);
          const result = await useCase.execute(validUserId, password);
          expect(result.success).toBe(true);
        }
      });

      it('should reject password shorter than 8 characters', async () => {
        const shortPasswords = [
          'Abc1!',
          'Pass1!',
          'Test1@',
        ];

        for (const password of shortPasswords) {
          await expect(useCase.execute(validUserId, password)).rejects.toThrow('Le mot de passe doit contenir au moins 8 caractères');
        }
      });

      it('should reject password longer than 128 characters', async () => {
        const longPassword = 'A'.repeat(129) + '1!';

        await expect(useCase.execute(validUserId, longPassword)).rejects.toThrow('Le mot de passe ne peut pas dépasser 128 caractères');
      });

      it('should reject password without lowercase letter', async () => {
        const passwordsWithoutLowercase = [
          'VALIDPASS123!',
          'TEST123@',
          'PASSWORD1!',
        ];

        for (const password of passwordsWithoutLowercase) {
          await expect(useCase.execute(validUserId, password)).rejects.toThrow('Le mot de passe doit contenir au moins une lettre minuscule');
        }
      });

      it('should reject password without uppercase letter', async () => {
        const passwordsWithoutUppercase = [
          'validpass123!',
          'test123@',
          'password1!',
        ];

        for (const password of passwordsWithoutUppercase) {
          await expect(useCase.execute(validUserId, password)).rejects.toThrow('Le mot de passe doit contenir au moins une lettre majuscule');
        }
      });

      it('should reject password without digit', async () => {
        const passwordsWithoutDigit = [
          'ValidPass!',
          'TestPassword@',
          'MySecurePass#',
        ];

        for (const password of passwordsWithoutDigit) {
          await expect(useCase.execute(validUserId, password)).rejects.toThrow('Le mot de passe doit contenir au moins un chiffre');
        }
      });

      it('should reject password without special character', async () => {
        const passwordsWithoutSpecial = [
          'ValidPass123',
          'TestPassword1',
          'MySecurePass2',
        ];

        for (const password of passwordsWithoutSpecial) {
          await expect(useCase.execute(validUserId, password)).rejects.toThrow('Le mot de passe doit contenir au moins un caractère spécial');
        }
      });

      it('should reject password with spaces', async () => {
        const passwordsWithSpaces = [
          'Valid Pass123!',
          'Test Password1@',
          'My Secure Pass2#',
        ];

        for (const password of passwordsWithSpaces) {
          await expect(useCase.execute(validUserId, password)).rejects.toThrow('Le mot de passe ne peut pas contenir d\'espaces');
        }
      });
    });

    describe('Clerk integration', () => {
      const validUserId = 'user_123';
      const validPassword = 'ValidPass123!';

      it('should successfully update password via Clerk', async () => {
        mockClerkClient.users.updateUser.mockResolvedValue({} as any);

        const result = await useCase.execute(validUserId, validPassword);

        expect(mockClerkClient.users.updateUser).toHaveBeenCalledWith(validUserId, {
          password: validPassword,
        });
        expect(result.success).toBe(true);
        expect(result.message).toBe('Votre mot de passe a été mis à jour avec succès.');
      });

      it('should handle Clerk pwned password error', async () => {
        const clerkError = {
          clerkError: true,
          errors: [{ code: 'form_password_pwned', message: 'Password found in data breach' }],
        };
        mockClerkClient.users.updateUser.mockRejectedValue(clerkError);

        await expect(useCase.execute(validUserId, validPassword)).rejects.toThrow(
          'Ce mot de passe a été trouvé dans une fuite de données. Pour la sécurité de votre compte, veuillez utiliser un mot de passe différent.'
        );
      });

      it('should handle Clerk validation failed error', async () => {
        const clerkError = {
          clerkError: true,
          errors: [{ code: 'form_password_validation_failed', message: 'Password validation failed' }],
        };
        mockClerkClient.users.updateUser.mockRejectedValue(clerkError);

        await expect(useCase.execute(validUserId, validPassword)).rejects.toThrow(
          'Le mot de passe ne respecte pas les critères de sécurité requis.'
        );
      });

      it('should handle Clerk too common password error', async () => {
        const clerkError = {
          clerkError: true,
          errors: [{ code: 'form_password_too_common', message: 'Password too common' }],
        };
        mockClerkClient.users.updateUser.mockRejectedValue(clerkError);

        await expect(useCase.execute(validUserId, validPassword)).rejects.toThrow(
          'Ce mot de passe est trop commun. Veuillez choisir un mot de passe plus unique.'
        );
      });

      it('should handle Clerk not strong enough password error', async () => {
        const clerkError = {
          clerkError: true,
          errors: [{ code: 'form_password_not_strong_enough', message: 'Password not strong enough' }],
        };
        mockClerkClient.users.updateUser.mockRejectedValue(clerkError);

        await expect(useCase.execute(validUserId, validPassword)).rejects.toThrow(
          'Le mot de passe n\'est pas assez fort. Veuillez utiliser un mot de passe plus complexe.'
        );
      });

      it('should handle Clerk user not found error', async () => {
        const error = new Error('User not found');
        mockClerkClient.users.updateUser.mockRejectedValue(error);

        await expect(useCase.execute(validUserId, validPassword)).rejects.toThrow('Utilisateur non trouvé');
      });

      it('should handle generic Clerk error', async () => {
        const clerkError = {
          clerkError: true,
          errors: [{ code: 'unknown_error', message: 'Unknown error occurred' }],
        };
        mockClerkClient.users.updateUser.mockRejectedValue(clerkError);

        await expect(useCase.execute(validUserId, validPassword)).rejects.toThrow('Unknown error occurred');
      });

      it('should handle rate limit error', async () => {
        const error = new Error('Rate limit exceeded');
        mockClerkClient.users.updateUser.mockRejectedValue(error);

        await expect(useCase.execute(validUserId, validPassword)).rejects.toThrow('Trop de tentatives. Veuillez réessayer plus tard.');
      });

      it('should handle unauthorized error', async () => {
        const error = new Error('Unauthorized 401');
        mockClerkClient.users.updateUser.mockRejectedValue(error);

        await expect(useCase.execute(validUserId, validPassword)).rejects.toThrow('Une erreur est survenue lors de la mise à jour du mot de passe.');
      });

      it('should handle forbidden error', async () => {
        const error = new Error('Forbidden 403');
        mockClerkClient.users.updateUser.mockRejectedValue(error);

        await expect(useCase.execute(validUserId, validPassword)).rejects.toThrow('Vous n\'avez pas les permissions pour mettre à jour le mot de passe.');
      });

      it('should handle invalid password policy error', async () => {
        const error = new Error('Invalid password policy');
        mockClerkClient.users.updateUser.mockRejectedValue(error);

        await expect(useCase.execute(validUserId, validPassword)).rejects.toThrow('Le mot de passe ne respecte pas la politique de sécurité');
      });

      it('should handle weak password error', async () => {
        const error = new Error('Weak password');
        mockClerkClient.users.updateUser.mockRejectedValue(error);

        await expect(useCase.execute(validUserId, validPassword)).rejects.toThrow('Le mot de passe est trop faible');
      });

      it('should handle unknown error', async () => {
        const error = new Error('Unknown error occurred');
        mockClerkClient.users.updateUser.mockRejectedValue(error);

        await expect(useCase.execute(validUserId, validPassword)).rejects.toThrow('Unknown error occurred');
      });
    });
  });

  describe('ResetPasswordController', () => {
    let controller: ResetPasswordController;
    let mockUseCase: jest.Mocked<ResetPasswordUseCaseImpl>;

    beforeEach(() => {
      mockUseCase = {
        execute: jest.fn(),
      } as any;
      controller = new ResetPasswordController(mockUseCase);
    });

    it('should return success response for valid request', async () => {
      const userId = 'user_123';
      const newPassword = 'ValidPass123!';
      const mockResult = { success: true, message: 'Password updated successfully' };

      mockUseCase.execute.mockResolvedValue(mockResult);

      const req = {
        body: { userId, newPassword },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.resetPassword(req, res);

      expect(mockUseCase.execute).toHaveBeenCalledWith(userId, newPassword);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: mockResult.message,
        data: { success: mockResult.success },
      });
    });

    it('should return error response when use case throws error', async () => {
      const userId = 'user_123';
      const newPassword = 'weak';
      const errorMessage = 'Password too weak';

      mockUseCase.execute.mockRejectedValue(new Error(errorMessage));

      const req = {
        body: { userId, newPassword },
      } as Request;

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.resetPassword(req, res);

      expect(mockUseCase.execute).toHaveBeenCalledWith(userId, newPassword);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: errorMessage,
        data: { success: false },
      });
    });

    it('should handle missing request body', async () => {
      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await controller.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: expect.any(String),
        data: { success: false },
      });
    });
  });

  describe('Reset Password Routes', () => {
    it('should return success response for valid request', async () => {
      const userId = 'user_123';
      const newPassword = 'ValidPass123!';

      mockClerkClient.users.updateUser.mockResolvedValue({} as any);

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ userId, newPassword })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        message: 'Votre mot de passe a été mis à jour avec succès.',
        data: { success: true },
      });
    });

    it('should return error response for missing userId', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ newPassword: 'ValidPass123!' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'L\'ID utilisateur est requis',
        data: { success: false },
      });
    });

    it('should return error response for missing newPassword', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ userId: 'user_123' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Le nouveau mot de passe est requis',
        data: { success: false },
      });
    });

    it('should return error response for weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ userId: 'user_123', newPassword: 'weak' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Le mot de passe doit contenir au moins 8 caractères',
        data: { success: false },
      });
    });

    it('should return error response for password without uppercase', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ userId: 'user_123', newPassword: 'validpass123!' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Le mot de passe doit contenir au moins une lettre majuscule',
        data: { success: false },
      });
    });

    it('should return error response for password without lowercase', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ userId: 'user_123', newPassword: 'VALIDPASS123!' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Le mot de passe doit contenir au moins une lettre minuscule',
        data: { success: false },
      });
    });

    it('should return error response for password without digit', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ userId: 'user_123', newPassword: 'ValidPass!' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Le mot de passe doit contenir au moins un chiffre',
        data: { success: false },
      });
    });

    it('should return error response for password without special character', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ userId: 'user_123', newPassword: 'ValidPass123' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Le mot de passe doit contenir au moins un caractère spécial',
        data: { success: false },
      });
    });

    it('should return error response for password with spaces', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ userId: 'user_123', newPassword: 'Valid Pass123!' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Le mot de passe ne peut pas contenir d\'espaces',
        data: { success: false },
      });
    });

    it('should return error response when user is not found', async () => {
      const error = new Error('User not found');
      mockClerkClient.users.updateUser.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ userId: 'nonexistent_user', newPassword: 'ValidPass123!' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Utilisateur non trouvé',
        data: { success: false },
      });
    });

    it('should return error response for pwned password', async () => {
      const clerkError = {
        clerkError: true,
        errors: [{ code: 'form_password_pwned', message: 'Password found in data breach' }],
      };
      mockClerkClient.users.updateUser.mockRejectedValue(clerkError);

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ userId: 'user_123', newPassword: 'ValidPass123!' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Ce mot de passe a été trouvé dans une fuite de données. Pour la sécurité de votre compte, veuillez utiliser un mot de passe différent.',
        data: { success: false },
      });
    });

    it('should return error response for rate limit', async () => {
      const error = new Error('Rate limit exceeded');
      mockClerkClient.users.updateUser.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ userId: 'user_123', newPassword: 'ValidPass123!' })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Trop de tentatives. Veuillez réessayer plus tard.',
        data: { success: false },
      });
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'L\'ID utilisateur est requis',
        data: { success: false },
      });
    });
  });
});
