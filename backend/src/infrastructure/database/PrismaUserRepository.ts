// src/infrastructure/database/PrismaUserRepository.ts
import { PrismaClient, Prisma, UserStatus } from '@prisma/client';
import { User as DomainUser } from '@/domain/entities/User';
import { Role } from '@/domain/entities/Role';
import { Organisation } from '@/domain/entities/Organisation';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';

const prisma = new PrismaClient();

// 1) Type exact retourné par Prisma pour cet include
type PrismaUserWithRels = Prisma.UserGetPayload<{
  include: { role: true; organisation: true };
}>;

// 2) Mapping vers le domaine (normalise les nulls si besoin)
export function toDomain(u: PrismaUserWithRels): DomainUser {
  return new DomainUser(
    u.id,
    u.email,
    u.username,
    u.firstName ?? '',                       // garde la ''abilité correcte
    u.lastName ?? '',
    u.avatar ?? '',
    u.password,
    u.isActive,
    new Role(u.role.id, u.role.name, u.role.createdAt, u.role.updatedAt),
    u.status,
    u.lastLoginAt ?? '',
    u.organisationId ?? null,
    u.organisation
      ? new Organisation(
          u.organisation.id,
          u.organisation.name,
          u.organisation.avatar ?? '',
          u.organisation.address,
          u.organisation.phone,
          u.organisation.createdAt,
          u.organisation.updatedAt,
        )
      : null,
    u.createdAt,
    u.updatedAt,
  );
}

export class PrismaUserRepository implements UserRepository {
  async findAll(): Promise<DomainUser[]> {
    const users: PrismaUserWithRels[] = await prisma.user.findMany({
      include: { role: true, organisation: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(toDomain);
  }

  async findUsersByOrganisationAndStatus(
    organisationId: number,
    statuses: UserStatus[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter,
  ): Promise<DomainUser[]> {
    const where: {
      organisationId: number;
      status: { in: UserStatus[] };
      role?: { name: { in: string[] } };
      lastLoginAt?: { gte?: Date; lt?: Date };
    } = {
      organisationId,
      status: { in: statuses },
    };

    if (roles?.length) where.role = { name: { in: roles } };

    if (lastLoginFilter) {
      const now = new Date();
      if (lastLoginFilter.type === 'recent') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        where.lastLoginAt = { gte: sevenDaysAgo };
      } else if (lastLoginFilter.type === 'last_month') {
        const firstOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const firstOfPrevMonth = new Date(
          Date.UTC(
            now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear(),
            now.getUTCMonth() === 0 ? 11 : now.getUTCMonth() - 1,
            1,
          ),
        );
        where.lastLoginAt = { gte: firstOfPrevMonth, lt: firstOfThisMonth };
      } else if (lastLoginFilter.type === 'custom_date') {
        const d = lastLoginFilter.date;
        const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
        where.lastLoginAt = { gte: d, lt: next };
      }
    }

    const users: PrismaUserWithRels[] = await prisma.user.findMany({
      where,
      include: { role: true, organisation: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(toDomain);
  }

  async findByOrganisationId(organisationId: number): Promise<DomainUser[]> {
    const users: PrismaUserWithRels[] = await prisma.user.findMany({
      where: { organisationId },
      include: { role: true, organisation: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(toDomain);
  }

  async findById(id: number): Promise<DomainUser | null> {
    const u = await prisma.user.findUnique({
      where: { id },
      include: { role: true, organisation: true },
    });
    return u ? toDomain(u as PrismaUserWithRels) : null; // asserter optionnel ici
  }
}
