import { validateEmail, validatePassword, validateOTPCode } from '@/lib/validation';

describe('validation utilities', () => {
  describe('validateEmail', () => {
    it('should return empty string for valid email', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'test123@test-domain.com',
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe('');
      });
    });

    it('should return error for empty email', () => {
      expect(validateEmail('')).toBe("L'adresse email est requise.");
      expect(validateEmail('   ')).toBe("L'adresse email est requise.");
    });

    it('should return error for invalid email format', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'test@.com',
        'test@example.',
        'test@example..com',
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe('Veuillez entrer une adresse email valide.');
      });
    });

    it('should return error for email too long', () => {
      const longEmail = `${'a'.repeat(250)}@example.com`;
      expect(validateEmail(longEmail)).toBe("L'adresse email est trop longue.");
    });
  });

  describe('validatePassword', () => {
    it('should return empty string for valid password', () => {
      const validPasswords = ['Password123!', 'MySecure1@Pass', 'Test123#Word', 'Complex$Pass9'];

      validPasswords.forEach(password => {
        expect(validatePassword(password)).toBe('');
      });
    });

    it('should return error for empty password', () => {
      expect(validatePassword('')).toBe('Le mot de passe est requis.');
      expect(validatePassword('   ')).toBe('Le mot de passe est requis.');
    });

    it('should return error for password too short', () => {
      expect(validatePassword('Pass1!')).toBe(
        'Le mot de passe doit contenir au moins 8 caractères.'
      );
    });

    it('should return error for password too long', () => {
      const longPassword = 'a'.repeat(129);
      expect(validatePassword(longPassword)).toBe('Le mot de passe est trop long.');
    });

    it('should return error for password with insufficient complexity', () => {
      const weakPasswords = [
        'password', // only lowercase
        'PASSWORD', // only uppercase
        '12345678', // only numbers
        '!@#$%^&*', // only special chars
        'Password', // no numbers or special chars
        'password123', // no uppercase or special chars
        'PASSWORD123', // no lowercase or special chars
        'Password', // no numbers or special chars
      ];

      weakPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(
          'Le mot de passe doit contenir au moins 3 des éléments suivants : majuscules, minuscules, chiffres, caractères spéciaux.'
        );
      });
    });
  });

  describe('validateOTPCode', () => {
    it('should return empty string for valid code', () => {
      expect(validateOTPCode('123456')).toBe('');
      expect(validateOTPCode('123456789', 9)).toBe('');
    });

    it('should return error for empty code', () => {
      expect(validateOTPCode('')).toBe('Le code est requis.');
      expect(validateOTPCode('   ')).toBe('Le code est requis.');
    });

    it('should return error for code too short', () => {
      expect(validateOTPCode('12345')).toBe('Le code doit contenir au moins 6 caractères.');
      expect(validateOTPCode('123', 4)).toBe('Le code doit contenir au moins 4 caractères.');
    });

    it('should use custom minLength parameter', () => {
      expect(validateOTPCode('1234', 4)).toBe('');
      expect(validateOTPCode('123', 4)).toBe('Le code doit contenir au moins 4 caractères.');
    });
  });
});
