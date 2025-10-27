import { CreateBeneficiaryCaseImpl } from '@/domain/use-cases/createBeneficiaryCaseImpl';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { User } from '@/domain/entities/User';

describe('CreateBeneficiaryCaseImpl', () => {
  let createBeneficiaryCase: CreateBeneficiaryCaseImpl;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<UserRepository>;

    createBeneficiaryCase = new CreateBeneficiaryCaseImpl(mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validData = {
      clerkUserId: 'clerk_123',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+221771234567',
    };

    it('should create a beneficiary successfully', async () => {
      // Arrange
      const expectedUser = new User(
        validData.clerkUserId,
        validData.name,
        validData.email,
        'beneficiary',
        validData.phoneNumber
      );
      mockUserRepository.save.mockResolvedValue(expectedUser);

      // Act
      const result = await createBeneficiaryCase.execute(
        validData.clerkUserId,
        validData.name,
        validData.email,
        validData.phoneNumber
      );

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: validData.clerkUserId,
          name: validData.name,
          email: validData.email,
          role: 'beneficiary',
          phoneNumber: validData.phoneNumber,
        })
      );
    });

    it('should throw error when clerkUserId is missing', async () => {
      // Act & Assert
      await expect(
        createBeneficiaryCase.execute('', validData.name, validData.email, validData.phoneNumber)
      ).rejects.toThrow("L'ID Clerk, le nom, l'email et le numéro de téléphone sont requis");
    });

    it('should throw error when name is missing', async () => {
      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(
          validData.clerkUserId,
          '',
          validData.email,
          validData.phoneNumber
        )
      ).rejects.toThrow("L'ID Clerk, le nom, l'email et le numéro de téléphone sont requis");
    });

    it('should throw error when email is missing', async () => {
      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(
          validData.clerkUserId,
          validData.name,
          '',
          validData.phoneNumber
        )
      ).rejects.toThrow("L'ID Clerk, le nom, l'email et le numéro de téléphone sont requis");
    });

    it('should throw error when phoneNumber is missing', async () => {
      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(validData.clerkUserId, validData.name, validData.email, '')
      ).rejects.toThrow("L'ID Clerk, le nom, l'email et le numéro de téléphone sont requis");
    });

    it('should throw error when email format is invalid', async () => {
      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(
          validData.clerkUserId,
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
          validData.clerkUserId,
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
          validData.clerkUserId,
          validData.name,
          'test.com',
          validData.phoneNumber
        )
      ).rejects.toThrow("Format d'email invalide");
    });

    it('should handle repository save error', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockUserRepository.save.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(
          validData.clerkUserId,
          validData.name,
          validData.email,
          validData.phoneNumber
        )
      ).rejects.toThrow('Échec de la création du bénéficiaire: Database connection failed');
    });

    it('should handle unknown repository error', async () => {
      // Arrange
      mockUserRepository.save.mockRejectedValue('Unknown error');

      // Act & Assert
      await expect(
        createBeneficiaryCase.execute(
          validData.clerkUserId,
          validData.name,
          validData.email,
          validData.phoneNumber
        )
      ).rejects.toThrow('Échec de la création du bénéficiaire');
    });

    it('should accept valid email formats', async () => {
      // Arrange
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
        'user123@test-domain.com',
      ];

      const expectedUser = new User(
        validData.clerkUserId,
        validData.name,
        validData.email,
        'beneficiary',
        validData.phoneNumber
      );
      mockUserRepository.save.mockResolvedValue(expectedUser);

      // Act & Assert
      const promises = validEmails.map(email =>
        createBeneficiaryCase.execute(
          validData.clerkUserId,
          validData.name,
          email,
          validData.phoneNumber
        )
      );

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });
});
