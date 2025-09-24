import type { User } from '@/domain/entities/User';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { PaginatedUseCase } from './PaginatedUseCase';
import type { PaginationInput, PaginatedResult, PaginatedRepository } from '@/utils/pagination';

export type PaginatedUsersResult = PaginatedResult<User>;

// Extension du repository spécifique avec les capacités de pagination
type PaginatedUserRepository = UserRepository & PaginatedRepository<User>;

export class GetPaginatedUsersUseCase extends PaginatedUseCase<User> {
  constructor(private readonly userRepository: PaginatedUserRepository) {
    super(userRepository);
  }

  async execute(input: PaginationInput): Promise<PaginatedUsersResult> {
    return super.execute(input);
  }
}
