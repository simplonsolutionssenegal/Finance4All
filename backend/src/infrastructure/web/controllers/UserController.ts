import { Request, Response, NextFunction } from 'express';
import { CreateUserUseCase } from '../../../application/use-cases/CreateUserUseCase';
import { asyncHandler } from '../middleware/error.middleware';
import { UserService } from '../services/user.service';
import { PrismaUserRepository } from '@/infrastructure/database/PrismaUserRepository';
import { UserStatus } from '@prisma/client';
import { GetUsersByOrganisationUseCase } from '@/application/use-cases/GetUsersByOrganisationUseCase';
import { GetUsersByOrganisationAndStatusUseCase } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';


// const userService = new UserService(new PrismaUserRepository());

export class UserController {
  constructor(private readonly userService: UserService
  ) { }


  // async create(req: Request, res: Response): Promise<void> {
  //   const { name, email } = req.body as { name: string; email: string };

  //   try {
  //     const user = await this.createUserUseCase.execute(name, email);
  //     res.status(201).json(user);
  //   } catch (error) {
  //     res.status(400).json({
  //       error: 'Erreur lors de la création de l\'utilisateur',
  //       message: error instanceof Error ? error.message : 'Erreur inconnue',
  //     });
  //   }
  // }



  async getUsersByOrganisation(req: Request, res: Response): Promise<void> {
    const organisationId = Number(req.params.organisationId);

    if (Number.isNaN(organisationId)) {
      res.status(400).json({
        status: 'fail',
        message: 'ID organisation invalide'
      });
      return;
    }

    try {
   
      const users = await this.userService.getUsersByOrganisation(organisationId);

      res.status(200).json({
        status: 'success',
        results: users.length,
        data: users.map(u => ({
          id: u.id,
          email: u.email,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          avatar: u.avatar,
          isActive: u.isActive,
          lastLoginAt: u.lastLoginAt,
          status: u.status,
          role: u.role?.name,
          organisationId: u.organisationId,
          organisation: u.organisation
            ? {
              id: u.organisation.id,
              name: u.organisation.name,
              avatar: u.organisation.avatar,
              address: u.organisation.address,
              phone: u.organisation.phone,
              createdAt: u.organisation.createdAt,
              updatedAt: u.organisation.updatedAt
            }
            : null,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt
        }))
      });
    } catch (err) {
      console.error('Error filtering users:', err);
      res.status(500).json({
        status: 'error',
        message: 'Erreur lors de la récupération des utilisateurs par organisation'
      });
    }
  }


  async getUsersByOrganisationFilter(req: Request, res: Response): Promise<void> {
    try {
      const organisationId = Number(req.params.organisationId);
      const { status, role, lastLogin, customDate } = req.query;

      if (Number.isNaN(organisationId)) {
        res.status(400).json({
          status: 'fail',
          message: 'ID organisation invalide'
        });
        return;
      }

      // Convertir le paramètre en tableau de statuts
      const statuses = status
        ? (Array.isArray(status) ? status : [status]) as UserStatus[]
        : [];

      // Convertir le paramètre de rôle en tableau
      const roles = role
        ? (Array.isArray(role) ? role : [role]) as string[]
        : undefined;

      // Gérer le filtre de date de dernière connexion
      let lastLoginFilter;
      if (lastLogin === 'recent') {
        lastLoginFilter = { type: 'recent' } as const;
      } else if (lastLogin === 'last_month') {
        lastLoginFilter = { type: 'last_month' } as const;
      } else if (lastLogin === 'custom') {
        if (!customDate) {
          res.status(400).json({
            status: 'fail',
            message: 'Le paramètre customDate est requis pour le filtre de date personnalisé'
          });
          return;
        }
        
        // Vérifier le format de la date (doit être YYYY-MM-DD)
        const dateStr = customDate as string;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateStr)) {
          res.status(400).json({
            status: 'fail',
            message: 'Format de date invalide. Utilisez le format YYYY-MM-DD (ex: 2025-09-01)'
          });
          return;
        }
        
        // Créer la date en UTC pour éviter les problèmes de fuseau horaire
        const date = new Date(dateStr + 'T00:00:00.000Z');
        if (isNaN(date.getTime())) {
          res.status(400).json({
            status: 'fail',
            message: 'Date invalide'
          });
          return;
        }
        
        lastLoginFilter = { type: 'custom_date' as const, date };
      }

       const users = await this.userService.getUsersByOrganisationAndStatus(organisationId, statuses, roles, lastLoginFilter);
     

      res.status(200).json({
        status: 'success',
        results: users.length,
        data: users.map(u => ({
          id: u.id,
          email: u.email,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          avatar: u.avatar,
          isActive: u.isActive,
          lastLoginAt: u.lastLoginAt,
          status: u.status,
          role: u.role?.name,
          organisationId: u.organisationId,
          organisation: u.organisation
            ? {
              id: u.organisation.id,
              name: u.organisation.name,
              avatar: u.organisation.avatar,
              address: u.organisation.address,
              phone: u.organisation.phone,
              createdAt: u.organisation.createdAt,
              updatedAt: u.organisation.updatedAt
            }
            : null,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt
        }))
      });
    } catch (error) {
      console.error('Error filtering users:', error);
      res.status(500).json({
        status: 'error',
        message: 'Une erreur est survenue lors du filtrage des utilisateurs'
      });
    }
  }
}
