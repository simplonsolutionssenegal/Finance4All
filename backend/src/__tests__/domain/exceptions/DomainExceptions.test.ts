import {
  DomainException,
  UserAlreadyExistsException,
  InvalidPasswordException,
  ValidationException,
} from '../../../domain/exceptions/DomainExceptions';

describe('DomainExceptions', () => {
  describe('DomainException (abstract class)', () => {
    // Créer une classe concrète pour tester la classe abstraite
    class TestDomainException extends DomainException {
      readonly code = 'TEST_ERROR';
    }

    it('should create a domain exception with correct properties', () => {
      const message = 'Test error message';
      const exception = new TestDomainException(message);

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(DomainException);
      expect(exception.message).toBe(message);
      expect(exception.code).toBe('TEST_ERROR');
      expect(exception.name).toBe('TestDomainException');
    });

    it('should have the constructor name as the exception name', () => {
      const exception = new TestDomainException('Test message');
      expect(exception.name).toBe('TestDomainException');
    });

    it('should be throwable and catchable', () => {
      const message = 'Throwable test message';
      
      expect(() => {
        throw new TestDomainException(message);
      }).toThrow(TestDomainException);

      expect(() => {
        throw new TestDomainException(message);
      }).toThrow(message);
    });
  });

  describe('UserAlreadyExistsException', () => {
    it('should create exception with correct code and message', () => {
      const email = 'test@example.com';
      const exception = new UserAlreadyExistsException(email);

      expect(exception).toBeInstanceOf(DomainException);
      expect(exception).toBeInstanceOf(UserAlreadyExistsException);
      expect(exception.code).toBe('USER_ALREADY_EXISTS');
      expect(exception.message).toBe(`Un utilisateur avec l'email ${email} existe déjà`);
      expect(exception.name).toBe('UserAlreadyExistsException');
    });

    it('should handle different email formats', () => {
      const testEmails = [
        'simple@test.com',
        'user.name+tag@domain.co.uk',
        'test123@subdomain.example.org',
      ];

      testEmails.forEach(email => {
        const exception = new UserAlreadyExistsException(email);
        expect(exception.message).toContain(email);
        expect(exception.code).toBe('USER_ALREADY_EXISTS');
      });
    });

    it('should be throwable and catchable', () => {
      const email = 'duplicate@test.com';
      
      expect(() => {
        throw new UserAlreadyExistsException(email);
      }).toThrow(UserAlreadyExistsException);

      expect(() => {
        throw new UserAlreadyExistsException(email);
      }).toThrow(`Un utilisateur avec l'email ${email} existe déjà`);
    });

    it('should handle empty email gracefully', () => {
      const exception = new UserAlreadyExistsException('');
      expect(exception.message).toBe(`Un utilisateur avec l'email  existe déjà`);
      expect(exception.code).toBe('USER_ALREADY_EXISTS');
    });
  });

  describe('InvalidPasswordException', () => {
    it('should create exception with correct code and message', () => {
      const message = 'Le mot de passe ne respecte pas les critères';
      const exception = new InvalidPasswordException(message);

      expect(exception).toBeInstanceOf(DomainException);
      expect(exception).toBeInstanceOf(InvalidPasswordException);
      expect(exception.code).toBe('INVALID_PASSWORD');
      expect(exception.message).toBe(message);
      expect(exception.name).toBe('InvalidPasswordException');
    });

    it('should handle different password error messages', () => {
      const testMessages = [
        'Mot de passe trop court',
        'Mot de passe doit contenir au moins une majuscule',
        'Mot de passe compromis détecté',
        'Mot de passe ne peut pas être identique au nom d\'utilisateur',
      ];

      testMessages.forEach(message => {
        const exception = new InvalidPasswordException(message);
        expect(exception.message).toBe(message);
        expect(exception.code).toBe('INVALID_PASSWORD');
      });
    });

    it('should be throwable and catchable', () => {
      const message = 'Invalid password format';
      
      expect(() => {
        throw new InvalidPasswordException(message);
      }).toThrow(InvalidPasswordException);

      expect(() => {
        throw new InvalidPasswordException(message);
      }).toThrow(message);
    });

    it('should handle empty message gracefully', () => {
      const exception = new InvalidPasswordException('');
      expect(exception.message).toBe('');
      expect(exception.code).toBe('INVALID_PASSWORD');
    });
  });

  describe('ValidationException', () => {
    it('should create exception with correct code and message', () => {
      const message = 'Données de validation invalides';
      const exception = new ValidationException(message);

      expect(exception).toBeInstanceOf(DomainException);
      expect(exception).toBeInstanceOf(ValidationException);
      expect(exception.code).toBe('VALIDATION_ERROR');
      expect(exception.message).toBe(message);
      expect(exception.name).toBe('ValidationException');
    });

    it('should handle different validation error messages', () => {
      const testMessages = [
        'Email invalide',
        'Nom requis',
        'Format de téléphone incorrect',
        'Date de naissance invalide',
        'Champ obligatoire manquant',
      ];

      testMessages.forEach(message => {
        const exception = new ValidationException(message);
        expect(exception.message).toBe(message);
        expect(exception.code).toBe('VALIDATION_ERROR');
      });
    });

    it('should be throwable and catchable', () => {
      const message = 'Validation failed';
      
      expect(() => {
        throw new ValidationException(message);
      }).toThrow(ValidationException);

      expect(() => {
        throw new ValidationException(message);
      }).toThrow(message);
    });

    it('should handle empty message gracefully', () => {
      const exception = new ValidationException('');
      expect(exception.message).toBe('');
      expect(exception.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Exception inheritance and polymorphism', () => {
    it('should all be instances of DomainException', () => {
      const userException = new UserAlreadyExistsException('test@test.com');
      const passwordException = new InvalidPasswordException('Invalid password');
      const validationException = new ValidationException('Validation error');

      expect(userException).toBeInstanceOf(DomainException);
      expect(passwordException).toBeInstanceOf(DomainException);
      expect(validationException).toBeInstanceOf(DomainException);
    });

    it('should all be instances of Error', () => {
      const userException = new UserAlreadyExistsException('test@test.com');
      const passwordException = new InvalidPasswordException('Invalid password');
      const validationException = new ValidationException('Validation error');

      expect(userException).toBeInstanceOf(Error);
      expect(passwordException).toBeInstanceOf(Error);
      expect(validationException).toBeInstanceOf(Error);
    });

    it('should have unique codes for each exception type', () => {
      const userException = new UserAlreadyExistsException('test@test.com');
      const passwordException = new InvalidPasswordException('Invalid password');
      const validationException = new ValidationException('Validation error');

      const codes = [userException.code, passwordException.code, validationException.code];
      const uniqueCodes = [...new Set(codes)];
      
      expect(uniqueCodes).toHaveLength(3);
      expect(codes).toContain('USER_ALREADY_EXISTS');
      expect(codes).toContain('INVALID_PASSWORD');
      expect(codes).toContain('VALIDATION_ERROR');
    });

    it('should be catchable as DomainException', () => {
      const exceptions = [
        new UserAlreadyExistsException('test@test.com'),
        new InvalidPasswordException('Invalid password'),
        new ValidationException('Validation error'),
      ];

      exceptions.forEach(exception => {
        try {
          throw exception;
        } catch (error) {
          expect(error).toBeInstanceOf(DomainException);
          expect(error).toHaveProperty('code');
          expect(typeof (error as DomainException).code).toBe('string');
        }
      });
    });
  });

  describe('Error stack traces', () => {
    it('should preserve stack traces', () => {
      const exception = new UserAlreadyExistsException('test@test.com');
      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe('string');
      expect(exception.stack).toContain('UserAlreadyExistsException');
    });

    it('should have different stack traces for different instantiations', () => {
      const exception1 = new ValidationException('Error 1');
      const exception2 = new ValidationException('Error 2');
      
      expect(exception1.stack).toBeDefined();
      expect(exception2.stack).toBeDefined();
      expect(exception1.stack).not.toBe(exception2.stack);
    });
  });
});
