import { Request, Response } from 'express';
import { DomainException } from '../../../domain/exceptions/DomainExceptions';
import { UserRole, UserStatus } from '../../../domain/entities/User'; 
import { SignUpUserUseCase } from '@/application/use-cases/SignUpUserUseCase';

export class UserController {
  constructor(
    private readonly signUpUserUseCase: SignUpUserUseCase,
  ) {
  }


  async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, lastName, firstName } = req.body as {
        email: string;
        password: string;
        lastName: string;
        firstName: string;
        role: UserRole.BENEFICIAIRE;
        status : UserStatus.ACTIF
      };

      const result = await this.signUpUserUseCase.execute({ email, password, lastName, firstName, role: UserRole.BENEFICIAIRE, status : UserStatus.ACTIF });

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
        },
      });
    } catch (err: unknown) {
      if (err instanceof DomainException) {
        res.status(400).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
      } else {
        const message = err instanceof Error ? err.message : 'Unknown error';
        const stack = err instanceof Error ? err.stack : undefined;
        console.error('Erreur inattendue lors de l\'inscription:', { message, stack, err });
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Une erreur inattendue s\'est produite',
          },
        });
      }
    }
  }
}
