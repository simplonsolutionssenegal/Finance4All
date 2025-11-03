import { CreateBeneficiaryUseCaseImpl } from '@/application/use-cases/CreateBeneficiaryUseCaseImpl';
import { User } from '@/domain/entities/User';

// Mock du logger
jest.mock('@/infrastructure/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('CreateBeneficiaryUseCaseImpl', () => {
  let createBeneficiaryCase: CreateBeneficiaryUseCaseImpl;

  beforeEach(() => {
    createBeneficiaryCase = new CreateBeneficiaryUseCaseImpl();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validData = {
      userId: 'user_123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+221771234567',
    };

    it('should create a beneficiary successfully', async () => {
      // Act
      const result = await createBeneficiaryCase.execute(
        validData.userId,
        validData.name,
        validData.email,
        validData.phoneNumber
      );

      // Assert
      expect(result).toEqual(
        new User(
          validData.userId,
          validData.name,
          validData.email,
          'beneficiary',
          validData.phoneNumber
        )
      );
      expect(result.id).toBe(validData.userId);
      expect(result.name).toBe(validData.name);
      expect(result.email).toBe(validData.email);
      expect(result.role).toBe('beneficiary');
      expect(result.phoneNumber).toBe(validData.phoneNumber);

      const { logger } = require('@/infrastructure/utils/logger');
      expect(logger.info).toHaveBeenCalledWith(`Bénéficiaire créé: ${validData.email}`, {
        userId: validData.userId,
      });
    });

    it('should throw error when userId is missing', async () => {
      // Act & Assert
      await expect(
        createBeneficiaryCase.execute('', validData.name, validData.email, validData.phoneNumber)
      ).rejects.toThrow("L'ID utilisateur, le nom, l'email et le numéro de téléphone sont requis");
    });

    it('should throw error when name is missing', async () => {
      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(validData.userId, '', validData.email, validData.phoneNumber)
      ).rejects.toThrow("L'ID utilisateur, le nom, l'email et le numéro de téléphone sont requis");
    });

    it('should throw error when email is missing', async () => {
      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(validData.userId, validData.name, '', validData.phoneNumber)
      ).rejects.toThrow("L'ID utilisateur, le nom, l'email et le numéro de téléphone sont requis");
    });

    it('should throw error when phoneNumber is missing', async () => {
      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(validData.userId, validData.name, validData.email, '')
      ).rejects.toThrow("L'ID utilisateur, le nom, l'email et le numéro de téléphone sont requis");
    });

    it('should throw error when email format is invalid', async () => {
      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(
          validData.userId,
          validData.name,
          'invalid-email',
          validData.phoneNumber
        )
      ).rejects.toThrow("Format d'email invalide");
    });

    it('should throw error when email format is invalid (no domain)', async () => {
      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(
          validData.userId,
          validData.name,
          'test@',
          validData.phoneNumber
        )
      ).rejects.toThrow("Format d'email invalide");
    });

    it('should throw error when email format is invalid (no @)', async () => {
      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(
          validData.userId,
          validData.name,
          'test.com',
          validData.phoneNumber
        )
      ).rejects.toThrow("Format d'email invalide");
    });

    it('should log beneficiary creation', async () => {
      const { logger } = require('@/infrastructure/utils/logger');

      await createBeneficiaryCase.execute(
        validData.userId,
        validData.name,
        validData.email,
        validData.phoneNumber
      );

      expect(logger.info).toHaveBeenCalledWith(`Bénéficiaire créé: ${validData.email}`, {
        userId: validData.userId,
      });
    });

    it('should handle errors in catch block', async () => {
      const { logger } = require('@/infrastructure/utils/logger');

      // Spy on User constructor and make it throw an error once
      const UserSpy = jest.spyOn(require('@/domain/entities/User'), 'User');

      // Make User constructor throw an error
      UserSpy.mockImplementationOnce(() => {
        throw new Error('User creation failed');
      });

      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(
          validData.userId,
          validData.name,
          validData.email,
          validData.phoneNumber
        )
      ).rejects.toThrow('Échec de la création du bénéficiaire: User creation failed');

      expect(logger.error).toHaveBeenCalledWith('Erreur lors de la création du bénéficiaire', {
        email: validData.email,
        error: expect.any(Error),
      });

      UserSpy.mockRestore();
    });

    it('should handle non-Error exceptions in catch block', async () => {
      const { logger } = require('@/infrastructure/utils/logger');

      // Spy on User constructor and make it throw a non-Error
      const UserSpy = jest.spyOn(require('@/domain/entities/User'), 'User');

      // Make User constructor throw a non-Error
      UserSpy.mockImplementationOnce(() => {
        throw 'Non-Error exception';
      });

      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(
          validData.userId,
          validData.name,
          validData.email,
          validData.phoneNumber
        )
      ).rejects.toThrow('Échec de la création du bénéficiaire');

      expect(logger.error).toHaveBeenCalledWith('Erreur lors de la création du bénéficiaire', {
        email: validData.email,
        error: 'Non-Error exception',
      });

      UserSpy.mockRestore();
    });

    it('should accept valid email formats', async () => {
      // Arrange
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
        'user123@test-domain.com',
      ];

      // Act & Assert
      const results = await Promise.all(
        validEmails.map(email =>
          createBeneficiaryCase.execute(
            validData.userId,
            validData.name,
            email,
            validData.phoneNumber
          )
        )
      );

      results.forEach((result, index) => {
        expect(result).toBeDefined();
        expect(result.email).toBe(validEmails[index]);
      });
    });
  });
});
