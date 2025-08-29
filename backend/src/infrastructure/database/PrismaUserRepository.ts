import { UserRepository } from '../../domain/repositories/UserRepository';
import { User as DomainUser } from '../../domain/entities/User';
import { prisma } from './prismaClient';

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<DomainUser | null> {
    // @ts-ignore - Prisma génère dynamiquement le client avec les modèles
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? new DomainUser(user.id, user.name, user.email) : null;
  }
  
  async save(user: DomainUser): Promise<DomainUser> {
    // @ts-ignore - Prisma génère dynamiquement le client avec les modèles
    const created = await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
    return new DomainUser(created.id, created.name, created.email);
  }
}
