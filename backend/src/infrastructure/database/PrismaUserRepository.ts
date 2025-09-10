import { PrismaClient, UserStatus } from '@prisma/client';
import { User } from '@/domain/entities/User';
import { Role } from '@/domain/entities/Role';
import { Organisation } from '@/domain/entities/Organisation';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { LastLoginFilter } from '@/application/use-cases/GetUsersByOrganisationAndStatusUseCase';

const prisma = new PrismaClient();

export class PrismaUserRepository implements UserRepository {

  async findAll(): Promise<User[]> {
    const users = await prisma.user.findMany({
      include: { role: true, organisation: true },
      orderBy: { createdAt: 'desc' }
    });
    return users.map(this.mapToDomain);
  }

  async create(data: {
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    password: string;
    isActive?: boolean;
    roleId: number;
    organisationId?: number;        // ✅ ajouté
    status?: UserStatus;            // (optionnel)
    lastLoginAt?: Date;             // (optionnel)
  }): Promise<User> {
    const user = await prisma.user.create({
      data,
      include: { role: true, organisation: true }
    });
    return this.mapToDomain(user);
  }

  async findUsersByStatus(statuses: UserStatus[]): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { status: { in: statuses } },
      include: { role: true, organisation: true },
      orderBy: { createdAt: 'desc' }
    });
    return users.map(this.mapToDomain);
  }

   async findUsersByOrganisationAndStatus(
    organisationId: number,
    statuses: any[],
    roles?: string[],
    lastLoginFilter?: LastLoginFilter
  ): Promise<User[]> {
    const where: any = {
      organisationId,
      status: { in: statuses },
    };

    if (roles?.length) {
      where.role = { name: { in: roles } };
    }

    // === lastLoginAt range ===
    if (lastLoginFilter) {
      const now = new Date();

      if (lastLoginFilter.type === 'recent') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        where.lastLoginAt = { gte: sevenDaysAgo };
      }

      if (lastLoginFilter.type === 'last_month') {
        // mois calendaire précédent (UTC)
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
        // de 00:00:00Z à 00:00:00Z du lendemain
        const d = lastLoginFilter.date; // déjà en UTC min d’après ton controller
        const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
        where.lastLoginAt = { gte: d, lt: next };
      }
    }

    const rows = await prisma.user.findMany({
      where,
      include: { role: true, organisation: true },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map(this.mapToDomain);
  }

  async findByOrganisationId(organisationId: number): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { organisationId },
      include: { role: true, organisation: true },
      orderBy: { createdAt: 'desc' }
    });
    return users.map(this.mapToDomain);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { role: true, organisation: true }
    });
    
    return user ? this.mapToDomain(user) : null;
  }

  async save(user: User): Promise<User> {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        username: user.username,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        avatar: user.avatar || null,
        isActive: user.isActive,
        status: user.status,
        lastLoginAt: user.lastLoginAt || undefined, // Utilisation de undefined au lieu de null pour Prisma
        organisationId: user.organisationId || null,
        roleId: user.role?.id || 1 // Valeur par défaut si non définie
      },
      include: { role: true, organisation: true }
    });
    
    return this.mapToDomain(updatedUser);
  }

  private mapToDomain(u: any): User {
    return new User(
      u.id,
      u.email,
      u.username,
      u.firstName ?? null,
      u.lastName ?? null,
      u.avatar ?? null,
      u.password,
      u.isActive,
      new Role(u.role.id, u.role.name, u.role.createdAt, u.role.updatedAt),
      u.status,
      u.lastLoginAt ?? null,
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
}
