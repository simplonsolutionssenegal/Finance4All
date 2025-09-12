export interface AuthenticationService {
  createUser(email: string, password: string): Promise<string>;
  verifyUser(userId: string): Promise<void>;
  hashPassword(password: string): Promise<string>;
  validatePassword(password: string, hashedPassword: string): Promise<boolean>;
}