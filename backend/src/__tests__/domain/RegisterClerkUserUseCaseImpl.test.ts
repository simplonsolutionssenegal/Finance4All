import { RegisterClerkUserUseCaseImpl } from '../../domain/use-cases/RegisterClerkUserUseCaseImpl';
import { UserRole, UserStatus } from '../../domain/entities/User';

// Mocks
const userRepository = {
  findByEmail: jest.fn(),
  findByClerkId: jest.fn(),
  createFromClerk: jest.fn(),
};

const emailService = {
  sendConfirmationEmail: jest.fn(),
};

describe('RegisterClerkUserUseCaseImpl', () => {
  const useCase = new RegisterClerkUserUseCaseImpl(
    userRepository as any,
    emailService as any,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('registers a new user when not existing and sends confirmation email', async () => {
    // Arrange
    userRepository.findByEmail.mockResolvedValueOnce(null);
    userRepository.findByClerkId.mockResolvedValueOnce(null);
    userRepository.createFromClerk.mockResolvedValueOnce({
      id: 1,
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.BENEFICIAIRE,
      status: UserStatus.ACTIF,
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      password: null,
      avatar: null,
      organisationId: null,
      username: null,
      clerkId: 'clrk_123',
    });

    const input = {
      email: 'john.doe@example.com',
      clerkId: 'clrk_123',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.BENEFICIAIRE,
      status: UserStatus.ACTIF,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(userRepository.findByEmail).toHaveBeenCalledWith('john.doe@example.com');
    expect(userRepository.findByClerkId).toHaveBeenCalledWith('clrk_123');
    expect(userRepository.createFromClerk).toHaveBeenCalled();
    expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith('john.doe@example.com', 'clrk_123');
    expect(result.user.email).toBe('john.doe@example.com');
  });

  it('throws when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValueOnce({ id: 1 });

    await expect(
      useCase.execute({
        email: 'exists@example.com',
        clerkId: 'clrk_999',
        firstName: 'Jane',
        lastName: 'Doe',
        role: UserRole.BENEFICIAIRE,
        status: UserStatus.ACTIF,
      } as any),
    ).rejects.toThrow('already exists');
  });

  it('throws when clerkId already exists', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(null);
    userRepository.findByClerkId.mockResolvedValueOnce({ id: 2 });

    await expect(
      useCase.execute({
        email: 'new@example.com',
        clerkId: 'clrk_dup',
        firstName: 'Jane',
        lastName: 'Doe',
        role: UserRole.BENEFICIAIRE,
        status: UserStatus.ACTIF,
      } as any),
    ).rejects.toThrow('already exists');
  });
});
