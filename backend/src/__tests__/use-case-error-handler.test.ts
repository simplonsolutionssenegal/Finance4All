import { describe, it, expect } from '@jest/globals';
import { UseCaseErrorHandler } from '../domain/use-cases/UseCaseErrorHandler';

describe('UseCaseErrorHandler', () => {
  describe('handleClerkError', () => {
    it('should handle non-Error exceptions for forgot password context', () => {
      expect(() => {
        UseCaseErrorHandler.handleClerkError('String error', 'l\'envoi du lien de réinitialisation');
      }).toThrow('Erreur inconnue lors de l\'envoi du lien de réinitialisation');
    });

    it('should handle non-Error exceptions for reset password context', () => {
      expect(() => {
        UseCaseErrorHandler.handleClerkError('String error', 'la mise à jour du mot de passe');
      }).toThrow('Erreur inconnue lors de la mise à jour du mot de passe');
    });

    it('should handle user not found error for forgot password context', () => {
      const error = new Error('User not found');
      expect(() => {
        UseCaseErrorHandler.handleClerkError(error, 'l\'envoi du lien de réinitialisation');
      }).toThrow('Aucun compte n\'est associé à cette adresse email');
    });

    it('should handle user not found error for reset password context', () => {
      const error = new Error('User not found');
      expect(() => {
        UseCaseErrorHandler.handleClerkError(error, 'la mise à jour du mot de passe');
      }).toThrow('Utilisateur non trouvé');
    });

    it('should handle rate limit error', () => {
      const error = new Error('Rate limit exceeded');
      expect(() => {
        UseCaseErrorHandler.handleClerkError(error, 'l\'envoi du lien de réinitialisation');
      }).toThrow('Trop de tentatives. Veuillez réessayer plus tard.');
    });

    it('should handle already sent error', () => {
      const error = new Error('Reset link already sent');
      expect(() => {
        UseCaseErrorHandler.handleClerkError(error, 'l\'envoi du lien de réinitialisation');
      }).toThrow('Un lien de réinitialisation a déjà été envoyé récemment. Veuillez vérifier votre boîte email ou réessayer plus tard');
    });

    it('should handle unauthorized error for forgot password context', () => {
      const error = new Error('Unauthorized access');
      expect(() => {
        UseCaseErrorHandler.handleClerkError(error, 'l\'envoi du lien de réinitialisation');
      }).toThrow('Une erreur est survenue lors de l\'envoi du lien de réinitialisation.');
    });

    it('should handle unauthorized error for reset password context', () => {
      const error = new Error('Unauthorized access');
      expect(() => {
        UseCaseErrorHandler.handleClerkError(error, 'la mise à jour du mot de passe');
      }).toThrow('Une erreur est survenue lors de la mise à jour du mot de passe.');
    });

    it('should handle forbidden error for forgot password context', () => {
      const error = new Error('403 forbidden');
      expect(() => {
        UseCaseErrorHandler.handleClerkError(error, 'l\'envoi du lien de réinitialisation');
      }).toThrow('Vous n\'avez pas les permissions pour envoyer un lien de réinitialisation.');
    });

    it('should handle forbidden error for reset password context', () => {
      const error = new Error('403 forbidden');
      expect(() => {
        UseCaseErrorHandler.handleClerkError(error, 'la mise à jour du mot de passe');
      }).toThrow('Vous n\'avez pas les permissions pour mettre à jour le mot de passe.');
    });

    it('should handle invalid password policy error', () => {
      const error = new Error('Invalid password policy');
      expect(() => {
        UseCaseErrorHandler.handleClerkError(error, 'la mise à jour du mot de passe');
      }).toThrow('Le mot de passe ne respecte pas la politique de sécurité');
    });

    it('should handle weak password error', () => {
      const error = new Error('Weak password detected');
      expect(() => {
        UseCaseErrorHandler.handleClerkError(error, 'la mise à jour du mot de passe');
      }).toThrow('Le mot de passe est trop faible');
    });

    it('should handle unknown error by returning original message', () => {
      const error = new Error('Unknown Clerk error');
      expect(() => {
        UseCaseErrorHandler.handleClerkError(error, 'l\'envoi du lien de réinitialisation');
      }).toThrow('Unknown Clerk error');
    });
  });
});
