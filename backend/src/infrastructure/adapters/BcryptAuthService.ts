import bcrypt from 'bcrypt';
import { AuthenticationService } from '../../domain/ports/AuthenticationService';

export class BcryptAuthService implements AuthenticationService {
  createUser(email: string, password: string): Promise<string> {
    // Ici, tu pourrais appeler un provider d'auth (Auth0, Clerk, Cognito…)
    // Pour l’exemple, on retourne juste un identifiant généré
    return Promise.resolve(`user_${Date.now()}`);
  }

  verifyUser(userId: string): Promise<void> {
    // Si tu utilises un provider externe, tu feras un appel API ici
    // Pour l’exemple, on suppose que l’utilisateur est automatiquement vérifié
    return Promise.resolve();
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10); // 10 = saltRounds
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
