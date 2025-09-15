import { CreateUserUseCase  } from '@/application/use-cases/CreateUserUseCase';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
  ) {
  }

}
