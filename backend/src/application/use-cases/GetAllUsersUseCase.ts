import { UserRepository} from '@/domain/repositories/UserRepository';

/**
 * Use case for retrieving all users.
 */

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute() {
    return this.userRepository.getAllUsers();
  }
}