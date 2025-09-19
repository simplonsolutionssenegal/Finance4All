import { UserStatus } from '@prisma/client';
import { User } from '../../domain/entities/User';

export interface CreateUserUseCase {
  execute(name : string): Promise<User>;
}

