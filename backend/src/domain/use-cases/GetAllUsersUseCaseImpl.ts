import { GetAllUsersUseCase } from '@/application/use-cases/GetAllUsersUseCase';
import { UserRepository } from '../../domain/repositories/UserRepository';

/**
 * Use case for retrieving all users.
 */

export class GetAllUsersUseCaseImpl implements GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

    async execute() {
    return this.userRepository.getAllUsers();
  }
}