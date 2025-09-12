import { User, CreateUserData } from '../entities/User';


export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  signUp(userData: CreateUserData): Promise<User>;

}