// backend/src/infrastructure/web/controllers/UserController.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { LastLoginFilter } from '@/types/lastLoginFilter';


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
        data: users.map(u => u.toJSON()), // 👈 ici
      });
    } catch {
      res.status(400).json({
        error: 'Une erreur est survenue lors du filtrage des utilisateurs',
        message: 'Erreur inconnue',
      });
    }
  }

  // async getUsersByOrganisationFilter(req: Request, res: Response) {
  //   const organisationId = this.parseOrganisationId(req, res);
  //   if (organisationId === null) return;

  //   try {
  //     const { status, role, lastLogin, customDate } = req.query;
  //     const statuses = this.parseStatuses(status);
  //     const roles = this.parseRoles(role);
  //     const lastLoginFilter = this.parseLastLoginFilter(lastLogin, customDate, res);
  //     if (lastLogin === 'custom' && !lastLoginFilter) return;

  //     const users = await this.userService.getUsersByOrganisationAndStatus(organisationId, statuses, roles, lastLoginFilter);

  //     res.status(200).json({
  //       status: 'success',
  //       results: users.length,
  //       data: users.map(u => u.toJSON()),
  //     });
  //   } catch (error: any) {
  //     res.status(500).json({ status: 'error', message: error.message });
  //   }
  // }

  //Fonction qui interviennent dans le filtre

  async getUsersByOrganisationFilter(req: Request, res: Response) {
    const organisationId = this.parseOrganisationId(req, res);
    if (organisationId === null) return;

    try {
      const { status, role, lastLogin, customDate } = req.query;
      const statuses = this.parseStatuses(status);
      const roles = this.parseRoles(role);
      const lastLoginFilter = this.parseLastLoginFilter(lastLogin, customDate, res);
      if (lastLogin === 'custom' && !lastLoginFilter) return;

      const users = await this.userService.getUsersByOrganisationAndStatus(
        organisationId,
        statuses,
        roles,
        lastLoginFilter,
      );

      res.status(200).json({
        status: 'success',
        results: users.length,
        data: users.map(u => u.toJSON()),
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ status: 'error', message: error.message });
      } else {
        res.status(500).json({ status: 'error', message: 'Erreur inconnue' });
      }
    }
  }


  private parseOrganisationId(req: Request, res: Response): number | null {
    const organisationId = Number(req.params.organisationId);
    if (Number.isNaN(organisationId)) {
      res.status(400).json({ status: 'fail', message: 'ID organisation invalide' });
      return null;
    }
    return organisationId;
  }

  private parseStatuses(status: unknown): ('ACTIF' | 'INACTIF' | 'EN_ATTENTE')[] {
    if (!status) return [];
    const s = Array.isArray(status) ? status : [status];
    return s as ('ACTIF' | 'INACTIF' | 'EN_ATTENTE')[];
  }

  private parseRoles(role: unknown): string[] | undefined {
    if (!role) return undefined;
    const r = Array.isArray(role) ? role : [role];
    return r as string[];
  }

  private parseLastLoginFilter(lastLogin: unknown, customDate: unknown, res: Response): LastLoginFilter | undefined {
    if (lastLogin === 'recent') return { type: 'recent' };
    if (lastLogin === 'last_month') return { type: 'last_month' };
    if (lastLogin === 'custom') {
      if (!customDate) {
        res.status(400).json({ status: 'fail', message: 'customDate requis' });
        return;
      }
      const date = new Date(customDate as string);
      if (isNaN(date.getTime())) {
        res.status(400).json({ status: 'fail', message: 'Date invalide' });
        return;
      }
      return { type: 'custom_date', date };
    }
    return undefined;
  }

  ///fin




}
