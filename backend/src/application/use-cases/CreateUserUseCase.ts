import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(name: string, email: string) {
    const user = new User(Date.now().toString(), name, email);
    return this.userRepository.save(user);
  }
}
