import { SignUpUserUseCase } from '@/application/use-cases/SignUpUserUseCase';
import { CreateUserInput } from '@/application/validators/UserValidator';

export class UserService {
  constructor(private readonly signUpUserUseCase: SignUpUserUseCase) {}

  async signUp(input: CreateUserInput) {
    return this.signUpUserUseCase.execute(input);
  }
}