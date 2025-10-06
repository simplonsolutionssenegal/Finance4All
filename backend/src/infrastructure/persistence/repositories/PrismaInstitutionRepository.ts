import type { InstitutionRepository } from '@/domain/institutions/repositories/InstitutionRepository';
import { Institution } from '@/domain/institutions/entities/Institution';
// eslint-disable-next-line no-duplicate-imports
import type { InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import type { Prisma, PrismaClient } from '@prisma/client';

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

    return institutions.map(i => this.toDomain(i));
  }

  private toDomain(prismaInstitution: any): Institution {
    return new Institution({
      id: EntityId.from(prismaInstitution.id),
      name: prismaInstitution.name,
      description: prismaInstitution.description,
      website: UrlValueObject.from(prismaInstitution.website),
      geographicZones: prismaInstitution.geographicZones,
      logoUrl: prismaInstitution.logoUrl,
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
      logoUrl: institution.logoUrl,
      status: institution.status as InstitutionStatus,
    };
  }
}
