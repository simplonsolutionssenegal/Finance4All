// src/infrastructure/database/PrismaUserRepository.ts
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';
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

      // Build display name from firstName/lastName, fallback to email local-part
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const name = fullName || user.email.split('@')[0];
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

      const [derivedFirstName, derivedLastName] = (() => {
        const [first, ...rest] = (user.name || '').split(' ').filter(Boolean);
        return [first || user.email.split('@')[0], rest.join(' ')];
      })();

      const savedUser = await prisma.user.create({
        data: {
          id: numericId,
          firstName: derivedFirstName,
          lastName: derivedLastName || '',
          email: user.email,
          clerkId: user.id, // reuse domain id as external clerk id
          role: UserRole.BENEFICIAIRE,
        },
      });

      // Build display name from saved firstName/lastName, fallback to email local-part
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
