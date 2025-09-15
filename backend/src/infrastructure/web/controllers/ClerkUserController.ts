import { Request, Response } from 'express';
import { RegisterClerkUserUseCase } from '@/application/use-cases/RegisterClerkUserUseCase';
import { ClerkRegisterSchema } from '@/application/validators/UserValidator';
import { DomainException } from '@/domain/exceptions/DomainExceptions';

export class ClerkUserController {
  constructor(private readonly registerUseCase: RegisterClerkUserUseCase) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      console.warn('Received registration request:', req.body);
      
      const parsed = ClerkRegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        const errorMessage = `Validation error: ${parsed.error.issues.map(i => i.message).join(', ')}`;
        console.error(errorMessage);
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: errorMessage,
          },
        });
        return;
      }

      console.warn('Calling register use case with data:', parsed.data);
      
      try {
        const result = await this.registerUseCase.execute(parsed.data);
        console.warn('Registration successful, user created:', result.user.id);
        
        res.status(201).json({
          success: true,
          message: result.message,
          data: {
            id: result.user.id,
            email: result.user.email,
            lastname: result.user.lastName,
            firstname: result.user.firstName,
            role: result.user.role,
            status: result.user.status,
            clerkId: result.user.clerkId,
          },
        });
      } catch (error) {
        console.error('Error in register use case:', error);
        throw error;
      }
    } catch (err: unknown) {
      if (err instanceof DomainException) {
        res.status(400).json({
          success: false,
          error: { code: err.code, message: err.message },
        });
        return;
      }
      const message = err instanceof Error ? err.message : 'Unknown error';
      const stack = err instanceof Error ? err.stack : undefined;
      console.error('Erreur inattendue lors de l\'inscription Clerk:', { message, stack, err });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: 'Une erreur inattendue s\'est produite' },
      });
    }
  }
}
