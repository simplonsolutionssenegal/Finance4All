import type { PrismaClient, User as PrismaUser } from '@prisma/client';
import type { UserRepository } from '@/domain/repositories/UserRepository';
import { User } from '@/domain/entities/User';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toDomain(user) : null;
  }

  async save(user: User): Promise<User> {
    const data = this.toPrismaData(user);

    const saved = await this.prisma.user.create({
      data,
    });

    return this.toDomain(saved);
  }

  private toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.name,
      prismaUser.email,
      'BENEFICIARY',
      prismaUser.phoneNumber || undefined
    );
  }

  private toPrismaData(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };
  }
}
