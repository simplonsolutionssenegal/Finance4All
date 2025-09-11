// src/infrastructure/database/PrismaOrganizationRepository.ts
import type { Organization as PrismaOrganization, Prisma, Status } from '@prisma/client';
import { prisma } from './prisma';
import { 
  OrganizationRepository, 
  OrganizationSearchParams, 
  PaginatedOrganizationsResult,
} from '../../domain/repositories/OrganizationRepository';
import { Organization as DomainOrganization } from '../../domain/entities/Organization';

// Map sûr entre les types Prisma et ton domaine
function toDomain(organization: PrismaOrganization): DomainOrganization {
  return new DomainOrganization(
    organization.id, 
    organization.name, 
    organization.type,
    organization.description,
    organization.status,
    organization.createdAt,
    organization.updatedAt,
  );
}

export class PrismaOrganizationRepository implements OrganizationRepository {
  async getAllOrganizations(): Promise<DomainOrganization[]> {
    const organizations = await prisma.organization.findMany();
    return organizations.map(toDomain);
  }
  
  async findById(id: string): Promise<DomainOrganization | null> {
    const organization = await prisma.organization.findUnique({ where: { id } });
    return organization ? toDomain(organization) : null;
  }

  async save(organization: DomainOrganization): Promise<DomainOrganization> {
    const created = await prisma.organization.create({
      data: {
        id: organization.id,
        name: organization.name,
        type: organization.type,
        description: organization.description,
        status: organization.status as Status,
      },
    });
    return toDomain(created);
  }

  async searchOrganizations(params: OrganizationSearchParams): Promise<PaginatedOrganizationsResult> {
    const {
      search,
      type,
      status,
      dateRange,
      customDate,
      page = 1,
      limit = 100,
      sortBy = 'name',
      sortOrder = 'asc',
    } = params;

    // Construction des conditions de recherche
    const where: Prisma.OrganizationWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { type: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type && type.length > 0) {
      where.type = { in: type };
    }

    if (status && status.length > 0) {
      where.status = { in: status as ('ACTIF' | 'EN_ATTENTE' | 'INACTIF' | 'SUSPENDU')[] };
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
    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.organization.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      organizations: organizations.map(toDomain),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getOrganizationTypes(): Promise<string[]> {
    const result = await prisma.organization.findMany({
      select: { type: true },
      distinct: ['type'],
      orderBy: { type: 'asc' },
    });

    return result.map(org => org.type);
  }
}
