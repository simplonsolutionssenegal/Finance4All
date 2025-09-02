// import { Request, Response, NextFunction } from 'express';
// import { asyncHandler } from '@/middleware/error.middleware';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export class UserController {
//   static readonly getUsers = asyncHandler(
//     // async (req: Request, res: Response, _next: NextFunction) => {
//     //   res.json({
//     //     status: 'success',
//     //     data: []
//     //   });
//     // }
// }

import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '@/middleware/error.middleware';
import { PrismaUserRepository } from '@/infrastructure/repositories/prisma-user.repository';
import { UserService } from '@/services/user.service';
import { UserStatus } from '@prisma/client';

const userService = new UserService(new PrismaUserRepository());
export class UserController {
  // constructor(private readonly userRepository: UserRepositoryPort) {}

  static readonly getUsers = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const users = await userService.getAllUsers();

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
        role: u.role.name,
        organisationId: u.organisationId,
        organisation: u.organisation ? {
          id: u.organisation.id,
          name: u.organisation.name,
          avatar: u.organisation.avatar,
          address: u.organisation.address,
          phone: u.organisation.phone,
          createdAt: u.organisation.createdAt,
          updatedAt: u.organisation.updatedAt
        } : null,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      }))
    });

  });


  static readonly createUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email, username, name, firstName, lastName, avatar, password, isActive, roleId, organisationId, status, lastLoginAt } = req.body;

    if (!email || !password || !roleId) {
      res.status(400).json({ status: 'fail', message: 'email, password et roleId sont requis' });
      return;
    }

    const user = await userService.createUser({
      email,
      username,
      firstName,
      lastName,
      avatar,
      status,
      lastLoginAt,
      password,
      isActive,
      organisationId,
      roleId
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastLoginAt: user.lastLoginAt,
        status: user.status,
        lastName: user.lastName,
        avatar: user.avatar,
        isActive: user.isActive,
        organisationId: user.organisation,
        role: user.role.name,
        createdAt: user.createdAt
      }
    });
  });

  static readonly getUsersByOrganisation = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const organisationId = Number(req.params.id);

      if (isNaN(organisationId)) {
        res.status(400).json({ status: 'fail', message: 'ID organisation invalide' });
        return; // pas de "return res..."
      }

      const users = await userService.getUsersByOrganisation(organisationId);

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
          role: u.role.name,
          organisationId: u.organisationId,
          organisation: u.organisation ? {
            id: u.organisation.id,
            name: u.organisation.name,
            avatar: u.organisation.avatar,
            address: u.organisation.address,
            phone: u.organisation.phone,
            createdAt: u.organisation.createdAt,
            updatedAt: u.organisation.updatedAt
          } : null,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt
        }))
      });
    }
  );

  static readonly getUsersByOrganisationFilter = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const organisationId = Number(req.params.id);
      const statusParam = req.query.status;
      const roleParam = req.query.role;

      if (isNaN(organisationId)) {
        res.status(400).json({ status: 'fail', message: 'ID organisation invalide' });
        return;
      }

      if (!statusParam) {
        res.status(400).json({ status: 'fail', message: 'Le paramètre status est requis' });
        return;
      }

      // Convertir le paramètre en tableau de statuts (peut être une chaîne ou un tableau de chaînes)
      const statuses = Array.isArray(statusParam) 
        ? statusParam as UserStatus[] 
        : [statusParam] as UserStatus[];
      
      // Convertir le paramètre de rôle en tableau (peut être une chaîne ou un tableau de chaînes)
      const roles = roleParam 
        ? (Array.isArray(roleParam) ? roleParam : [roleParam]) as string[]
        : undefined;
      
      // Valider les statuts
      const validStatuses = Object.values(UserStatus);
      const invalidStatuses = statuses.filter(status => !validStatuses.includes(status as UserStatus));
      
      if (invalidStatuses.length > 0) {
        res.status(400).json({
          status: 'error',
          message: `Statut(s) invalide(s) : ${invalidStatuses.join(', ')}. Statuts valides : ${validStatuses.join(', ')}`
        });
        return;
      }

      const users = await userService.getUsersByOrganisationAndStatus(organisationId, statuses, roles);

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
          role: u.role.name,
          organisationId: u.organisationId,
          organisation: u.organisation ? {
            id: u.organisation.id,
            name: u.organisation.name,
            avatar: u.organisation.avatar,
            address: u.organisation.address,
            phone: u.organisation.phone,
            createdAt: u.organisation.createdAt,
            updatedAt: u.organisation.updatedAt
          } : null,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt
        }))
      });
    }
  );
}

