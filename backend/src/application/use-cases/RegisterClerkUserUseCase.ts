import { User } from '../../domain/entities/User';
import { ClerkRegisterInput } from '../validators/UserValidator';

export interface RegisterClerkUserUseCase {
  execute(input: ClerkRegisterInput): Promise<{ user: User; message: string }>; 
}
