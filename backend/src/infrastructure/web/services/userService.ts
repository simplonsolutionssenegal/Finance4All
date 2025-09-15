import { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import { CreateUserInput } from '@/application/validators/UserValidator';

export class UserService {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async signUp(input: CreateUserInput) {
    const name = `${input.firstName} ${input.lastName}`.trim();
    return this.createUserUseCase.execute(name, input.email);
  }
}