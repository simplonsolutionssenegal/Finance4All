// src/infrastructure/database/PrismaUserRepository.ts
import { prisma } from './prisma';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { User as DomainUser } from '@/domain/entities/User';

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<DomainUser | null> {
    try {
      // Convert string ID to number for Prisma query
      const numericId = parseInt(id, 10);

      if (isNaN(numericId)) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { id: numericId },
      });

      if (!user) {
        return null;
      }

      // Extract name from email if name is not provided
      const name = user.name || user.email.split('@')[0];
      return new DomainUser(user.id?.toString() || id, name, user.email);
    } catch (error) {
      console.warn('Error finding user:', error);
      // Re-throw the error so tests can catch it
      throw error;
    }
  }

  async save(user: DomainUser): Promise<DomainUser> {
    try {
      // Convert string ID to number for Prisma
      const numericId = parseInt(user.id, 10);

      const savedUser = await prisma.user.create({
        data: {
          id: numericId,
          name: user.name,
          email: user.email,
        },
      });

      // Extract name from email if name is not provided
      const name = savedUser.name || savedUser.email.split('@')[0];
      return new DomainUser(savedUser.id.toString(), name, savedUser.email);
    } catch (error) {
      console.warn('Error saving user:', error);
      // Re-throw the error so tests can catch it
      throw error;
    }
  }
}
