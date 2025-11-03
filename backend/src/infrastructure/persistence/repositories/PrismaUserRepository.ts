import type { PrismaClient, User as PrismaUser } from '@prisma/client';
import { User } from '@/domain/entities/User';

export class PrismaUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toDomain(user) : null;
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
}
