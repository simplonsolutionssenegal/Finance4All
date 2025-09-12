// src/infrastructure/database/PrismaUserRepository.ts
import { PrismaClient, UserStatus } from '@prisma/client';
import type {
  User as PrismaUser,
  Role as PrismaRole,
  Organisation as PrismaOrganisation,
} from '@prisma/client';

import { User as DomainUser } from '@/domain/entities/User';
import { Role } from '@/domain/entities/Role';
import { Organisation } from '@/domain/entities/Organisation';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';

const prisma = new PrismaClient();

type PrismaUserWithRels = PrismaUser & {
  role: PrismaRole;
  organisation: PrismaOrganisation | null;
};

export function toDomain(u: PrismaUserWithRels): DomainUser {
  return new DomainUser(
    u.id,
    u.email,
    u.username,
    u.firstName,                                // non-null (schéma)
    u.lastName,                                 // non-null (schéma)
    u.avatar ?? '',                 // domaine non-null → fallback
    u.password,
    u.isActive,
    new Role(u.role.id, u.role.name, u.role.createdAt, u.role.updatedAt),
    u.status,
    u.lastLoginAt ?? null,                      // tu as gardé Date | null dans le domaine
    u.organisationId ?? null,
    u.organisation
      ? new Organisation(
          u.organisation.id,
          u.organisation.name,
          u.organisation.avatar ?? '',
          u.organisation.address,
          u.organisation.phone,
          u.organisation.createdAt,
          u.organisation.updatedAt
        )
      : null,
    u.createdAt,
    u.updatedAt
  );
}

export class PrismaUserRepository implements UserRepository {

  async findAll(): Promise<DomainUser[]> {
    const user = await prisma.user.findMany({
      include: { role: true, organisation: true },
      orderBy: { createdAt: 'desc' },
    });
    return user.map(toDomain);
  }

  async create(data: {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    password: string;
    isActive?: boolean;
    roleId: number;
    organisationId?: number | null;
    status?: UserStatus;
    lastLoginAt?: Date | null;
  }): Promise<DomainUser> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        firstName: data.firstName,                 // requis
        lastName:  data.lastName,                  // requis
        avatar:    data.avatar ?? null,            // BD nullable
        password:  data.password,
        isActive:  data.isActive ?? true,
        roleId:    data.roleId,
        organisationId: data.organisationId ?? null,
        status:    data.status ?? 'ACTIF',
        ...(data.lastLoginAt ? { lastLoginAt: data.lastLoginAt } : {}),
      },
      include: { role: true, organisation: true },
    });

    return toDomain(user);
  }

  async findUsersByStatus(statuses: UserStatus[]): Promise<DomainUser[]> {
    const user = await prisma.user.findMany({
      where: { status: { in: statuses } },
      include: { role: true, organisation: true },
      orderBy: { createdAt: 'desc' },
    });
    return user.map(toDomain);
  }

  async findUsersByOrganisationAndStatus(
    organisationId: number,
    statuses: UserStatus[],               // tape précis
    roles?: string[],
    lastLoginFilter?: LastLoginFilter
  ): Promise<DomainUser[]> {
    const where: any = {
      organisationId,
      status: { in: statuses },
    };

    if (roles?.length) {
      where.role = { name: { in: roles } };
    }

    if (lastLoginFilter) {
      const now = new Date();

      if (lastLoginFilter.type === 'recent') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        where.lastLoginAt = { gte: sevenDaysAgo };
      }

      if (lastLoginFilter.type === 'last_month') {
        const firstOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const firstOfPrevMonth = new Date(
          Date.UTC(
            now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear(),
            now.getUTCMonth() === 0 ? 11 : now.getUTCMonth() - 1,
            1
          )
        );
        where.lastLoginAt = { gte: firstOfPrevMonth, lt: firstOfThisMonth };
      }

      if (lastLoginFilter.type === 'custom_date') {
        const d = lastLoginFilter.date;
        const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
        where.lastLoginAt = { gte: d, lt: next };
      }
    }

    const user = await prisma.user.findMany({
      where,
      include: { role: true, organisation: true },
      orderBy: { createdAt: 'desc' },
    });

    return user.map(toDomain);
  }

  async findByOrganisationId(organisationId: number): Promise<DomainUser[]> {
    const user = await prisma.user.findMany({
      where: { organisationId },
      include: { role: true, organisation: true },
      orderBy: { createdAt: 'desc' },
    });
    return user.map(toDomain);
  }

  async findById(id: number): Promise<DomainUser | null> {
    const user = await prisma.user.findUnique({
      where: { id },                             // id est number dans ton interface
      include: { role: true, organisation: true },
    });

    return user ? toDomain(user) : null;
  }

  async save(user: DomainUser): Promise<DomainUser> {
    const created = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isActive: user.isActive,
        status: user.status,
        // si tu veux vraiment garder Date|null en domaine :
        ...(user.lastLoginAt != null ? { lastLoginAt: user.lastLoginAt } : {}),
        organisationId: user.organisationId ?? null,
        roleId: user.role?.id ?? 1,
      },
      include: { role: true, organisation: true },
    });

    return toDomain(created);
    }
}
