import { SignUpUserUseCase } from '@/application/use-cases/SignUpUserUseCase';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { AuthenticationService } from '../../domain/ports/AuthenticationService';
import { CreateUserData, User, UserStatus, UserRole } from '../../domain/entities/User';
import { UserAlreadyExistsException, ValidationException } from '../../domain/exceptions/DomainExceptions';
import { CreateUserSchema, CreateUserInput } from '@/application/validators/UserValidator';
import { NodemailerEmailService } from '@/infrastructure/adapters/NodemailerEmailService';

export class SignUpUserUseCaseImpl implements SignUpUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: NodemailerEmailService,
    private readonly authService: AuthenticationService,
  ) {}

  async execute(input: CreateUserInput): Promise<{ user: User; message: string }> {
    const validationResult = CreateUserSchema.safeParse(input);
    if (!validationResult.success) {
      throw new ValidationException(
        validationResult.error.issues.map(issue => issue.message).join(', '),
      );
    }

    const { email, password, lastName, firstName } = validationResult.data;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsException(email);
    }

    const hashedPassword = await this.authService.hashPassword(password);
    const clerkUserId = await this.authService.createUser(email, password);

    const userData: CreateUserData = { email, password: hashedPassword, lastName, firstName, role: UserRole.BENEFICIAIRE, status: UserStatus.ACTIF };
    const user = await this.userRepository.signUp(userData);

    await this.emailService.sendConfirmationEmail(email, clerkUserId);

    return { user, message: 'Inscription réussie. Un email de confirmation a été envoyé.' };
  }
}
