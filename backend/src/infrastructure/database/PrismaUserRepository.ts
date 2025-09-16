import { PrismaClient } from '@prisma/client';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { User, CreateUserData, CreateClerkUserData } from '@/domain/entities/User';

const prisma = new PrismaClient();

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? (user as User) : null;
  }

  async findByClerkId(clerkId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { clerkId } });
    return user ? (user as User) : null;
  }

  signUp(_data: CreateUserData): Promise<User> {
    return Promise.reject(
      new Error('Password-based sign up is not supported. Use createFromClerk.')
    );
  }

  async createFromClerk(data: CreateClerkUserData): Promise<User> {
    console.warn('PrismaUserRepository.createFromClerk - Input data:', data);

    try {
      const userData = {
        email: data.email,
        clerkId: data.clerkId,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        status: data.status,
      };

      console.warn('PrismaUserRepository.createFromClerk - Creating user with data:', userData);

      const user = await prisma.user.create({
        data: userData,
      });

      console.warn('PrismaUserRepository.createFromClerk - User created successfully:', user);
      return user as User;
    } catch (error) {
      console.error('PrismaUserRepository.createFromClerk - Error creating user:', error);
      throw error;
    }
  }
}
