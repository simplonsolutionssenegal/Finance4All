import { Request, Response } from 'express';
import { GetAllUsersUseCase } from '@/application/use-cases/GetAllUsersUseCase';
import { CreateUserUseCase } from '../../../application/use-cases/CreateUserUseCase';
import { logger } from '../../../utils/logger';
import { UserSearchParamsSchema } from '../schemas/user.schemas';
import { SearchUsersUseCase } from '@/application/use-cases/SearchUsersUseCase';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly searchUsersUseCase: SearchUsersUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
  ) {
    // Injection de dépendances
  }

  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.getAllUsersUseCase.execute();
      res.status(200).json(users);
    } catch (error) {
      logger.error('Error fetching all users', { error });
      res.status(500).json({
        error: 'Erreur lors de la récupération des utilisateurs',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    const { username, email, firstName, lastName, roleId, organizationId, status } = req.body as {
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      roleId: string;
      organizationId?: string;
      status?: string;
    };

    // Validate required fields
    if (!username || !email || !firstName || !lastName || !roleId) {
      res.status(400).json({
        error: 'Champs requis manquants',
        message: 'Les champs username, email, firstName, lastName et roleId sont requis',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: 'Format d\'email invalide',
        message: 'Veuillez fournir un email valide',
      });
      return;
    }

    try {
      const userData = { username, email, firstName, lastName, roleId, organizationId, status };
      const user = await this.createUserUseCase.execute(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({
        error: 'Erreur lors de la création de l\'utilisateur',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
  
  async search(req: Request, res: Response): Promise<void> {
    try {
      // Validation des paramètres de recherche
      const validationResult = UserSearchParamsSchema.safeParse(req.query);
      
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Paramètres de recherche invalides',
          details: validationResult.error.issues,
        });
        return;
      }

      const searchParams = validationResult.data;
      logger.info('Searching users with params', { searchParams });

      const result = await this.searchUsersUseCase.execute(searchParams);
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error searching users', { error, query: req.query });
      res.status(500).json({
        error: 'Erreur lors de la recherche des organisations',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      });
    }
  }
}
