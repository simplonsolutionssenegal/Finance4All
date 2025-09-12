import { PrismaClient } from '@prisma/client';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { User, CreateUserData } from '@/domain/entities/User';

const prisma = new PrismaClient();

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? (user as User) : null;
  }

  async signUp(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        role: data.role,
        status: data.status,
      },
    });
    return user as User;
  }
}
