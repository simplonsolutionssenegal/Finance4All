// backend/src/infrastructure/web/controllers/UserController.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { UserStatus } from '@prisma/client';

export class UserController {
  constructor(private readonly userService: UserService) { }

  async getUsersByOrganisation(req: Request, res: Response): Promise<void> {
    const organisationId = Number(req.params.organisationId);

    if (Number.isNaN(organisationId)) {
      res.status(400).json({
        status: 'fail',
        message: 'ID organisation invalide',
      });
      return;
    }

    try {
      const users = await this.userService.getUsersByOrganisation(organisationId);

      res.status(200).json({
        status: 'success',
        results: users.length,
        data: users.map((u) => ({
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
              updatedAt: u.organisation.updatedAt,
            }
            : null,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        })),
      });
    } catch {
      res.status(400).json({
        error: 'Une erreur est survenue lors du filtrage des utilisateurs',
        message: 'Erreur inconnue',
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
          message: 'ID organisation invalide',
        });
        return;
      }

      let statuses: UserStatus[] = [];
      if (status !== undefined && status !== null) {
        const s = Array.isArray(status) ? status : [status];
        statuses = s as UserStatus[];
      }

      let roles: string[] | undefined = undefined;
      if (role !== undefined && role !== null) {
        const r = Array.isArray(role) ? role : [role];
        roles = r as string[];
      }
      let lastLoginFilter;
      if (lastLogin === 'recent') {
        lastLoginFilter = { type: 'recent' } as const;
      } else if (lastLogin === 'last_month') {
        lastLoginFilter = { type: 'last_month' } as const;
      } else if (lastLogin === 'custom') {
        if (!customDate) {
          res.status(400).json({
            status: 'fail',
            message: 'Le paramètre customDate est requis pour le filtre de date personnalisé',
          });
          return;
        }

        const dateStr = customDate as string;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateStr)) {
          res.status(400).json({
            status: 'fail',
            message: 'Format de date invalide. Utilisez le format YYYY-MM-DD (ex: 2025-09-01)',
          });
          return;
        }

        const date = new Date(dateStr + 'T00:00:00.000Z');
        if (isNaN(date.getTime())) {
          res.status(400).json({
            status: 'fail',
            message: 'Date invalide',
          });
          return;
        }

        lastLoginFilter = { type: 'custom_date' as const, date };
      }

      const users = await this.userService.getUsersByOrganisationAndStatus(
        organisationId,
        statuses,
        roles,
        lastLoginFilter,
      );

      res.status(200).json({
        status: 'success',
        results: users.length,
        data: users.map((u) => ({
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
              updatedAt: u.organisation.updatedAt,
            }
            : null,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        })),
      });
    } catch {
      res.status(500).json({
        status: 'error',
        message: 'Une erreur est survenue lors du filtrage des utilisateurs',
      });
    }
  }
}
