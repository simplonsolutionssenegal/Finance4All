import { RegisterClerkUserUseCase } from '@/application/use-cases/RegisterClerkUserUseCase';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { User, UserRole, UserStatus } from '@/domain/entities/User';
import { ClerkRegisterInput, ClerkRegisterSchema } from '@/application/validators/UserValidator';
import { NodemailerEmailService } from '@/infrastructure/adapters/NodemailerEmailService';
import { UserAlreadyExistsException, ValidationException } from '@/domain/exceptions/DomainExceptions';

export class RegisterClerkUserUseCaseImpl implements RegisterClerkUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: NodemailerEmailService,
  ) {}

  async execute(input: ClerkRegisterInput): Promise<{ user: User; message: string }> {
    console.warn('Starting registration with input:', input);
    
    try {
      const result = ClerkRegisterSchema.safeParse(input);
      if (!result.success) {
        const errorMessage = `Validation failed: ${result.error.issues.map(i => i.message).join(', ')}`;
        console.error(errorMessage);
        throw new ValidationException(errorMessage);
      }

      const { email, clerkId, firstName, lastName } = result.data;
      console.warn('Processing registration for:', { email, clerkId });

      try {
        console.warn('Checking for existing user with email:', email);
        const existingByEmail = await this.userRepository.findByEmail(email);
        if (existingByEmail) {
          const errorMessage = `User with email ${email} already exists`;
          console.error(errorMessage);
          throw new UserAlreadyExistsException(errorMessage);
        }

        console.warn('Checking for existing user with clerkId:', clerkId);
        const existingByClerk = await this.userRepository.findByClerkId(clerkId);
        if (existingByClerk) {
          const errorMessage = `User with clerkId ${clerkId} already exists`;
          console.error(errorMessage);
          throw new UserAlreadyExistsException(errorMessage);
        }

        const userData = {
          email,
          clerkId,
          firstName,
          lastName,
          role: UserRole.BENEFICIAIRE,
          status: UserStatus.ACTIF,
        };

        console.warn('Creating user with data:', userData);
        const user = await this.userRepository.createFromClerk(userData);
        console.warn('User created successfully with ID:', user.id);

        try {
          console.warn('Sending confirmation email to:', email);
          await this.emailService.sendConfirmationEmail(email, clerkId);
          console.warn('Confirmation email sent successfully');
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // On continue même si l'email échoue
        }

        return { user, message: 'Inscription réussie. Bienvenue !' };
      } catch (error) {
        console.error('Error during user registration:', error);
        throw error;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }
}
