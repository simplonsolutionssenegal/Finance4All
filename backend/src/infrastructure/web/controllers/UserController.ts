// backend/src/infrastructure/web/controllers/UserController.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { UserStatus } from '@prisma/client';
import { User } from '@/domain/entities/User';

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
        data: users.map((user) => this.UserResponse(user)),
      });
    } catch {
      res.status(400).json({
        error: 'Une erreur est survenue lors du filtrage des utilisateurs',
        message: 'Erreur inconnue',
      });
    }
  }

  private parseOrganisationId(req: Request, res: Response): number | null {
    const organisationId = Number(req.params.organisationId);
    if (Number.isNaN(organisationId)) {
      res.status(400).json({
        status: 'fail',
        message: 'ID organisation invalide',
      });
      return null;
    }
    return organisationId;
  }

  private UserResponse(user: User) {
    return {
      id: user.id,
      clerkUserId : user.clerkUserId,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      status: user.status,
      role: user.role?.name,
      organisationId: user.organisationId,
      organisation: user.organisation
        ? {
          id: user.organisation.id,
          name: user.organisation.name,
          avatar: user.organisation.avatar,
          address: user.organisation.address,
          phone: user.organisation.phone,
          createdAt: user.organisation.createdAt,
          updatedAt: user.organisation.updatedAt,
        }
        : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private parseStatuses(status: unknown): UserStatus[] {
    if (!status) return [];
    const s = Array.isArray(status) ? status : [status];
    return s as UserStatus[];
  }

  private parseRoles(role: unknown): string[] | undefined {
    if (!role) return undefined;
    const r = Array.isArray(role) ? role : [role];
    return r as string[];
  }

  private parseLastLoginFilter(
    lastLogin: unknown,
    customDate: unknown,
    res: Response,
  ):
    | { type: 'recent' }
    | { type: 'last_month' }
    | { type: 'custom_date'; date: Date }
    | undefined {
    if (lastLogin === 'recent') return { type: 'recent' };
    if (lastLogin === 'last_month') return { type: 'last_month' };

    if (lastLogin === 'custom') {
      if (!customDate) {
        res.status(400).json({
          status: 'fail',
          message:
            'Le paramètre customDate est requis pour le filtre de date personnalisé',
        });
        return;
      }

      const dateStr = customDate as string;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateStr)) {
        res.status(400).json({
          status: 'fail',
          message:
            'Format de date invalide. Utilisez YYYY-MM-DD (ex: 2025-09-01)',
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

      return { type: 'custom_date', date };
    }

    return undefined;
  }

  async getUsersByOrganisationFilter(req: Request, res: Response): Promise<void> {
    const organisationId = this.parseOrganisationId(req, res);
    if (organisationId === null) return;

    try {
      const { status, role, lastLogin, customDate } = req.query;

      const statuses = this.parseStatuses(status);
      const roles = this.parseRoles(role);
      const lastLoginFilter = this.parseLastLoginFilter(
        lastLogin,
        customDate,
        res,
      );
      if (lastLogin === 'custom' && !lastLoginFilter) return; // stop si erreur customDate

      const users = await this.userService.getUsersByOrganisationAndStatus(
        organisationId,
        statuses,
        roles,
        lastLoginFilter,
      );

      res.status(200).json({
        status: 'success',
        results: users.length,
        data: users.map((u) => this.UserResponse(u)),
      });
    } catch {
      res.status(500).json({
        status: 'error',
        message: 'Une erreur est survenue lors du filtrage des utilisateurs',
      });
    }
  }





}
