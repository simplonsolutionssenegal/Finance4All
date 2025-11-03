import {
  validateEmail,
  validatePassword,
  validateOTPCode,
  validateFirstName,
  validateLastName,
  validatePhone,
  validateBeneficiaryField,
} from '@/lib/validation';

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

  describe('validateFirstName', () => {
    it('should return empty string for valid first name', () => {
      const validNames = ['John', 'Marie-Claire', 'Jean-Pierre', 'Amadou', 'José', 'François'];
      validNames.forEach(name => {
        expect(validateFirstName(name)).toBe('');
      });
    });

    it('should return error for empty first name', () => {
      expect(validateFirstName('')).toBe('Le prénom est requis.');
      expect(validateFirstName('   ')).toBe('Le prénom est requis.');
    });

    it('should return error for first name too short', () => {
      expect(validateFirstName('A')).toBe('Le prénom doit contenir au moins 2 caractères.');
    });

    it('should return error for first name too long', () => {
      const longName = 'A'.repeat(51);
      expect(validateFirstName(longName)).toBe('Le prénom ne peut pas dépasser 50 caractères.');
    });

    it('should return error for first name with invalid characters', () => {
      const invalidNames = ['John123', 'John@Doe', 'John_Doe', 'John.Doe'];
      invalidNames.forEach(name => {
        expect(validateFirstName(name)).toBe(
          'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes.'
        );
      });
    });
  });

  describe('validateLastName', () => {
    it('should return empty string for valid last name', () => {
      const validNames = ['Doe', 'Smith-Jones', "O'Brien", 'Diallo', 'García', 'Van Der Berg'];
      validNames.forEach(name => {
        expect(validateLastName(name)).toBe('');
      });
    });

    it('should return error for empty last name', () => {
      expect(validateLastName('')).toBe('Le nom est requis.');
      expect(validateLastName('   ')).toBe('Le nom est requis.');
    });

    it('should return error for last name too short', () => {
      expect(validateLastName('D')).toBe('Le nom doit contenir au moins 2 caractères.');
    });

    it('should return error for last name too long', () => {
      const longName = 'D'.repeat(51);
      expect(validateLastName(longName)).toBe('Le nom ne peut pas dépasser 50 caractères.');
    });

    it('should return error for last name with invalid characters', () => {
      const invalidNames = ['Doe123', 'Doe@Smith', 'Doe_Smith', 'Doe.Smith'];
      invalidNames.forEach(name => {
        expect(validateLastName(name)).toBe(
          'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes.'
        );
      });
    });
  });

  describe('validatePhone', () => {
    it('should return empty string for valid phone numbers', () => {
      const validPhones = [
        '+221771234567',
        '+22370112233',
        '+33612345678',
        '+12345678901',
        '+221 77 123 4567',
        '+223-701-122-33',
      ];
      validPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe('');
      });
    });

    it('should return error for empty phone', () => {
      expect(validatePhone('')).toBe('Le numéro de téléphone est requis.');
      expect(validatePhone('   ')).toBe('Le numéro de téléphone est requis.');
    });

    it('should return error for phone without + prefix', () => {
      expect(validatePhone('221771234567')).toBe(
        'Le numéro doit commencer par + suivi du code pays (ex: +22370112233).'
      );
    });

    it('should return error for invalid phone format', () => {
      const invalidPhones = [
        '+22177abc123',
        '+221',
        '+22177',
        '+abc123456789',
        '+0123456789', // starts with 0 after +
      ];
      invalidPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(
          'Numéro de téléphone invalide (format international requis).'
        );
      });
    });
  });

  describe('validateBeneficiaryField', () => {
    it('should validate firstName field', () => {
      expect(validateBeneficiaryField('firstName', 'John')).toBe('');
      expect(validateBeneficiaryField('firstName', '')).toBe('Le prénom est requis.');
    });

    it('should validate lastName field', () => {
      expect(validateBeneficiaryField('lastName', 'Doe')).toBe('');
      expect(validateBeneficiaryField('lastName', '')).toBe('Le nom est requis.');
    });

    it('should validate phone field', () => {
      expect(validateBeneficiaryField('phone', '+221771234567')).toBe('');
      expect(validateBeneficiaryField('phone', '')).toBe('Le numéro de téléphone est requis.');
    });

    it('should validate email field', () => {
      expect(validateBeneficiaryField('email', 'test@example.com')).toBe('');
      expect(validateBeneficiaryField('email', '')).toBe("L'adresse email est requise.");
    });

    it('should return empty string for unknown field', () => {
      expect(validateBeneficiaryField('unknown', 'value')).toBe('');
    });
  });
});
