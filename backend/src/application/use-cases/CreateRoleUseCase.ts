import { UserStatus } from '@prisma/client';
import { User } from '../../domain/entities/User';


export interface CreateRoleUseCase {
 execute(name: string): Promise<User>;
}