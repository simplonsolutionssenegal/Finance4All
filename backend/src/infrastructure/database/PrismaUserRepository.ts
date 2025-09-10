// src/infrastructure/database/PrismaUserRepository.ts
import type { User as PrismaUser } from '@prisma/client';
import { prisma } from './prisma';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { User as DomainUser } from '@/domain/entities/User';

// Map sûr entre les types Prisma et ton domaine
function toDomain(user: PrismaUser): DomainUser {
  return new DomainUser(user.id, user.name ?? '', user.email);
}

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<DomainUser | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toDomain(user) : null;
  }

  async save(user: DomainUser): Promise<DomainUser> {
    const created = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
    return toDomain(created);
  }
}
