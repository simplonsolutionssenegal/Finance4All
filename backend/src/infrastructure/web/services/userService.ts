import { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase';
import { CreateUserInput } from '@/application/validators/UserValidator';

export class UserService {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async signUp(input: CreateUserInput) {
    return this.createUserUseCase.execute(input);
  }
}