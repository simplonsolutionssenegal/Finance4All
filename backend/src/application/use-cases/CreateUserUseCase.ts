import { UserStatus } from '@prisma/client';
import { User } from '../../domain/entities/User';

export interface CreateUserDTO {
    /**
   * Exécute la création d'un utilisateur
   * @param name - Le nom de l'utilisateur
   * @param email - L'email de l'utilisateur
   * @returns Une promesse contenant l'utilisateur créé
   */
  email: string;
  username: string;
  password: string;
  roleId: number;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  organisationId?: number | null;
  status?: UserStatus;       // défaut: ACTIF
  isActive?: boolean;        // défaut: true
  lastLoginAt?: Date | null; // défaut: new Date()
}

export interface CreateUserUseCase {
  execute(dto: CreateUserDTO): Promise<User>;
}

