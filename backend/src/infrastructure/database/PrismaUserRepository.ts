// src/infrastructure/database/PrismaUserRepository.ts
import type { Prisma, User as PrismaUser, Role, Organization } from '@prisma/client';
import { prisma } from './prisma';
import { 
  UserRepository,
  UserSearchParams,
  PaginatedUsersResult,
} from '../../domain/repositories/UserRepository';
import { User as DomainUser } from '../../domain/entities/User';

// Type pour les utilisateurs avec relations
type UserWithRelations = PrismaUser & {
  role: Role;
  organization: Organization | null;
};

// Map sûr entre les types Prisma et ton domaine (avec relations)
function toDomainWithRelations(user: UserWithRelations): DomainUser {
  return new DomainUser(
    user.id, 
    user.username,
    user.email,
    user.firstName,
    user.lastName,
    user.roleId,
    user.organizationId,
    user.status,
    user.lastLoginAt,
    user.createdAt,
    user.updatedAt,
    user.role,
    user.organization,
  );
}

export class PrismaUserRepository implements UserRepository {
  async getAllUsers(): Promise<DomainUser[]> {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        organization: true,
      },
    });
    return users.map(toDomainWithRelations);
  }
  
  async findById(id: string): Promise<DomainUser | null> {
    const user = await prisma.user.findUnique({ 
      where: { id },
      include: {
        role: true,
        organization: true,
      },
    });
    return user ? toDomainWithRelations(user) : null;
  }

  async save(user: DomainUser): Promise<DomainUser> {
    const created = await prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: 'temp_password', // Temporaire - sera géré par Clerk
        roleId: user.roleId,
        organizationId: user.organizationId,
        status: user.status as 'ACTIF' | 'EN_ATTENTE' | 'INACTIF' | 'SUSPENDU',
        lastLoginAt: user.lastLoginAt,
      },
      include: {
        role: true,
        organization: true,
      },
    });
    return toDomainWithRelations(created);
  }

  async searchUsers(params: UserSearchParams): Promise<PaginatedUsersResult> {
    const {
      search,
      status,
      roleId,
      organizationId,
      dateRange,
      customDate,
      page = 1,
      limit = 100,
      sortBy = 'firstName',
      sortOrder = 'asc',
    } = params;
    
    // Construction des conditions de recherche
    const where: Prisma.UserWhereInput = {};
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status.length > 0) {
      where.status = { in: status as ('ACTIF' | 'EN_ATTENTE' | 'INACTIF' | 'SUSPENDU')[] };
    }

    if (roleId && roleId.length > 0) {
      where.roleId = { in: roleId };
    }

    if (organizationId && organizationId.length > 0) {
      where.organizationId = { in: organizationId };
    }

    // Date filtering
    if (dateRange) {
      const now = new Date();
      let dateFilter: Date;
      
      switch (dateRange) {
        case 'recent':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
          where.createdAt = { gte: dateFilter };
          break;
        case 'month':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
          where.createdAt = { gte: dateFilter };
          break;
        case 'custom':
          if (customDate) {
            const customDateObj = new Date(customDate);
            where.createdAt = { gte: customDateObj };
          }
          break;
      }
    }

    // Calcul de la pagination
    const skip = (page - 1) * limit;

    // Construction du tri
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy]: sortOrder,
    };

    // Exécution des requêtes en parallèle
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          role: true,
          organization: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(toDomainWithRelations),
      total,
      page,
      limit,
      totalPages,
    };
  }


}
