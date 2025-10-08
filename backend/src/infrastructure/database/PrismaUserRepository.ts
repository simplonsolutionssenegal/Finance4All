// src/infrastructure/database/PrismaUserRepository.ts
import { prisma } from './prisma';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { User as DomainUser } from '@/domain/entities/User';

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<DomainUser | null> {
    try {
      // Prisma expects numeric ID
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return null;
      }
      const user = await prisma.user.findUnique({ where: { id: numericId } });

      if (!user) {
        return null;
      }

      // Build display name from firstName/lastName, fallback to email local-part
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const name = fullName || user.email.split('@')[0];
      return new DomainUser(user.id.toString(), name, user.email);
    } catch (error) {
      console.warn('Error finding user:', error);
      // Re-throw the error so tests can catch it
      throw error;
    }
  }

  async save(user: DomainUser): Promise<DomainUser> {
    try {
      const numericId = parseInt(user.id, 10);
      const displayName = user.name || user.email.split('@')[0];
      const [firstName, ...rest] = displayName.split(' ').filter(Boolean);
      const lastName = rest.join(' ');

      const savedUser = await prisma.user.create({
        data: {
          id: numericId,
          firstName: firstName || displayName,
          lastName: lastName || '',
          email: user.email,
          clerkId: user.id,
          role: 'BENEFICIAIRE',
        },
      });

      const savedFullName = `${savedUser.firstName || ''} ${savedUser.lastName || ''}`.trim();
      const name = savedFullName || savedUser.email.split('@')[0];
      return new DomainUser(savedUser.id.toString(), name, savedUser.email);
    } catch (error) {
      console.warn('Error saving user:', error);
      // Re-throw the error so tests can catch it
      throw error;
    }
  }
}
