import {
  validateFullName,
  validatePhone,
  validateEmail,
  validatePassword,
} from '@/lib/register-validation';
import {
  validateEmail as validateEmailBase,
  validatePassword as validatePasswordBase,
} from '@/lib/validation';

// Mock des fonctions de validation de base
jest.mock('@/lib/validation', () => ({
  validateEmail: jest.fn(),
  validatePassword: jest.fn(),
}));

const mockValidateEmailBase = validateEmailBase as jest.MockedFunction<typeof validateEmailBase>;
const mockValidatePasswordBase = validatePasswordBase as jest.MockedFunction<
  typeof validatePasswordBase
>;

describe('register-validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFullName', () => {
    it('should return null for valid full name', () => {
      expect(validateFullName('John Doe')).toBeNull();
      expect(validateFullName('Marie-Claire Dupont')).toBeNull();
      expect(validateFullName('Jean-Pierre')).toBeNull();
    });

    it('should return error for empty name', () => {
      expect(validateFullName('')).toBe('Le nom complet est requis');
      expect(validateFullName('   ')).toBe('Le nom complet est requis');
    });

    it('should return error for name too short', () => {
      expect(validateFullName('J')).toBe('Le nom doit contenir au moins 2 caractères');
    });

    it('should return error for name too long', () => {
      const longName = 'A'.repeat(101);
      expect(validateFullName(longName)).toBe('Le nom ne peut pas dépasser 100 caractères');
    });

    it('should handle names with exactly 2 characters', () => {
      expect(validateFullName('Jo')).toBeNull();
    });

    it('should handle names with exactly 100 characters', () => {
      const name100 = 'A'.repeat(100);
      expect(validateFullName(name100)).toBeNull();
    });

    it('should trim whitespace before validation', () => {
      expect(validateFullName('  John Doe  ')).toBeNull();
      expect(validateFullName('  J  ')).toBe('Le nom doit contenir au moins 2 caractères');
    });
  });

  describe('validatePhone', () => {
    it('should return null for valid phone numbers', () => {
      expect(validatePhone('+221771234567')).toBeNull();
      expect(validatePhone('221771234567')).toBeNull();
      expect(validatePhone('+33 1 23 45 67 89')).toBeNull();
      expect(validatePhone('0123456789')).toBeNull();
    });

    it('should return error for empty phone', () => {
      expect(validatePhone('')).toBe('Le numéro de téléphone est requis');
      expect(validatePhone('   ')).toBe('Le numéro de téléphone est requis');
    });

    it('should return error for phone too short', () => {
      expect(validatePhone('1234567')).toBe(
        'Le numéro de téléphone doit contenir au moins 8 chiffres'
      );
      expect(validatePhone('+123456')).toBe(
        'Le numéro de téléphone doit contenir au moins 8 chiffres'
      );
    });

    it('should return error for phone too long', () => {
      const longPhone = '1'.repeat(21);
      expect(validatePhone(longPhone)).toBe(
        'Le numéro de téléphone ne peut pas dépasser 20 caractères'
      );
    });

    it('should clean phone number by removing non-numeric characters except +', () => {
      expect(validatePhone('+221 77 12 34 56')).toBeNull();
      expect(validatePhone('(221) 77-12-34-56')).toBeNull();
      expect(validatePhone('+221.77.12.34.56')).toBeNull();
    });

    it('should handle phones with exactly 8 digits', () => {
      expect(validatePhone('12345678')).toBeNull();
    });

    it('should handle phones with exactly 20 characters', () => {
      const phone20 = '1'.repeat(20);
      expect(validatePhone(phone20)).toBeNull();
    });

    it('should preserve + sign in cleaned phone', () => {
      expect(validatePhone('+221 77 12 34 56')).toBeNull();
      expect(validatePhone('221 77 12 34 56')).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('should call validateEmailBase and return null when no error', () => {
      mockValidateEmailBase.mockReturnValue('');

      const result = validateEmail('test@example.com');

      expect(mockValidateEmailBase).toHaveBeenCalledWith('test@example.com');
      expect(result).toBeNull();
    });

    it('should call validateEmailBase and return error message when validation fails', () => {
      const errorMessage = 'Email invalide';
      mockValidateEmailBase.mockReturnValue(errorMessage);

      const result = validateEmail('invalid-email');

      expect(mockValidateEmailBase).toHaveBeenCalledWith('invalid-email');
      expect(result).toBe(errorMessage);
    });

    it('should handle empty email', () => {
      mockValidateEmailBase.mockReturnValue('Email requis');

      const result = validateEmail('');

      expect(mockValidateEmailBase).toHaveBeenCalledWith('');
      expect(result).toBe('Email requis');
    });
  });

  describe('validatePassword', () => {
    it('should call validatePasswordBase and return null when no error', () => {
      mockValidatePasswordBase.mockReturnValue('');

      const result = validatePassword('ValidPass123!');

      expect(mockValidatePasswordBase).toHaveBeenCalledWith('ValidPass123!');
      expect(result).toBeNull();
    });

    it('should call validatePasswordBase and return error message when validation fails', () => {
      const errorMessage = 'Mot de passe trop faible';
      mockValidatePasswordBase.mockReturnValue(errorMessage);

      const result = validatePassword('weak');

      expect(mockValidatePasswordBase).toHaveBeenCalledWith('weak');
      expect(result).toBe(errorMessage);
    });

    it('should handle empty password', () => {
      mockValidatePasswordBase.mockReturnValue('Mot de passe requis');

      const result = validatePassword('');

      expect(mockValidatePasswordBase).toHaveBeenCalledWith('');
      expect(result).toBe('Mot de passe requis');
    });
  });
});
