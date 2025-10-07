import { Institution } from '@/domain/institutions/entities/Institution';
// eslint-disable-next-line no-duplicate-imports
import type { InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import type {
  Prisma,
  PrismaClient,
  Institution as PrismaInstitution,
  InstitutionStatus as PrismaInstitutionStatus,
} from '@prisma/client';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import type { PaginationParams, PaginatedResult } from '@/domain/shared/Pagination';

export class PrismaInstitutionRepository implements InstitutionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(institution: Institution): Promise<Institution> {
    const data = this.toPrismaData(institution);

    const saved = await this.prisma.institution.create({
      data,
    });

    return this.toDomain(saved);
  }

  async findById(id: EntityId): Promise<Institution | null> {
    const institution = await this.prisma.institution.findUnique({
      where: { id: id.getValue() },
    });

    return institution ? this.toDomain(institution) : null;
  }

  async findByName(name: string): Promise<Institution[]> {
    const institutions = await this.prisma.institution.findMany({
      where: { name },
    });

    return institutions.map((i: PrismaInstitution) => this.toDomain(i));
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Institution>> {
    const skip = (params.page - 1) * params.limit;

    const [institutions, total] = await Promise.all([
      this.prisma.institution.findMany({
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.institution.count(),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: institutions.map((i: PrismaInstitution) => this.toDomain(i)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  private toDomain(prismaInstitution: PrismaInstitution): Institution {
    return new Institution({
      id: EntityId.from(prismaInstitution.id),
      name: prismaInstitution.name,
      description: prismaInstitution.description,
      website: UrlValueObject.from(prismaInstitution.website),
      geographicZones: prismaInstitution.geographicZones,
      logoUrl: UrlValueObject.from(prismaInstitution.logoUrl),
      status: prismaInstitution.status as InstitutionStatus,
    });
  }

  private toPrismaData(institution: Institution): Prisma.InstitutionCreateInput {
    return {
      id: institution.id.getValue(),
      name: institution.name,
      description: institution.description,
      website: institution.website.getValue(),
      geographicZones: institution.geographicZones,
      logoUrl: institution.logoUrl.getValue(),
      status: institution.status as PrismaInstitutionStatus,
    };
  }
}
