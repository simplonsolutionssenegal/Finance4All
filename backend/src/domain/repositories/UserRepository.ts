import { User, CreateUserData, CreateClerkUserData } from '../entities/User';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findByClerkId(clerkId: string): Promise<User | null>;
  signUp(userData: CreateUserData): Promise<User>;
  createFromClerk(userData: CreateClerkUserData): Promise<User>;
}
