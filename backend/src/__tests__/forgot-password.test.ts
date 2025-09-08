import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ForgotPasswordUseCaseImpl } from '../domain/use-cases/ForgotPasswordUseCaseImpl';

// Mock de clerkClient
jest.mock('@clerk/express', () => ({
  clerkClient: {
    users: {
      getUserList: jest.fn(),
    },
  },
}));

import { clerkClient } from '@clerk/express';

describe('Forgot Password', () => {
  let forgotPasswordUseCase: ForgotPasswordUseCaseImpl;
  const mockClerkClient = clerkClient as jest.Mocked<typeof clerkClient>;

  beforeEach(() => {
    forgotPasswordUseCase = new ForgotPasswordUseCaseImpl();
    jest.clearAllMocks();
  });

  describe('Clerk configuration', () => {
    it('should handle Clerk API errors gracefully', async () => {
      const email = 'test@example.com';
      const clerkErrors = [
        { error: 'unauthorized access', expectedMessage: 'Erreur de configuration Clerk.' },
        { error: '403 forbidden', expectedMessage: 'Accès refusé à l\'API Clerk.' },
        { error: 'rate limit exceeded', expectedMessage: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        { error: 'already sent recently', expectedMessage: 'Un lien de réinitialisation a déjà été envoyé récemment. Veuillez vérifier votre boîte email ou réessayer plus tard' },
      ];

      for (const { error, expectedMessage } of clerkErrors) {
        mockClerkClient.users.getUserList.mockRejectedValue(new Error(error));

        await expect(forgotPasswordUseCase.execute(email))
          .rejects.toThrow(expectedMessage);
      }
    });

    it('should handle unknown Clerk errors', async () => {
      const email = 'test@example.com';
      mockClerkClient.users.getUserList.mockRejectedValue(new Error('Unknown Clerk error'));

      await expect(forgotPasswordUseCase.execute(email))
        .rejects.toThrow('Erreur lors de l\'envoi du lien de réinitialisation');
    });
  });

  describe('Email validation', () => {
    it('should accept valid email format', async () => {
      const validEmail = 'test@example.com';
      mockClerkClient.users.getUserList.mockResolvedValue({
        data: [{ id: 'user_123', emailAddresses: [{ emailAddress: validEmail }] }],
        totalCount: 1,
      } as any);

      const result = await forgotPasswordUseCase.execute(validEmail);

      expect(result.success).toBe(true);
      expect(mockClerkClient.users.getUserList).toHaveBeenCalledWith({
        emailAddress: [validEmail],
      });
    });

    it('should reject invalid email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test.example.com',
      ];

      for (const email of invalidEmails) {
        await expect(forgotPasswordUseCase.execute(email))
          .rejects.toThrow('Format d\'email invalide');
      }
    });

    it('should reject empty email', async () => {
      await expect(forgotPasswordUseCase.execute(''))
        .rejects.toThrow('L\'email est requis');
    });
  });

  describe('User existence check', () => {
    it('should return success when user exists', async () => {
      const email = 'existing@example.com';
      mockClerkClient.users.getUserList.mockResolvedValue({
        data: [{ id: 'user_123', emailAddresses: [{ emailAddress: email }] }],
        totalCount: 1,
      } as any);

      const result = await forgotPasswordUseCase.execute(email);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Un lien de réinitialisation a été envoyé à votre adresse email.');
    });

    it('should throw error when user does not exist', async () => {
      const email = 'nonexistent@example.com';
      mockClerkClient.users.getUserList.mockResolvedValue({
        data: [],
        totalCount: 0,
      } as any);

      await expect(forgotPasswordUseCase.execute(email))
        .rejects.toThrow('Erreur lors de l\'envoi du lien de réinitialisation');
    });
  });
});
