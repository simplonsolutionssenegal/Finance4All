import { InstitutionFinanciere } from '../../domain/entities/InstitutionFinanciere';
import { InstitutionFinanciereRepository } from '../../domain/repositories/InstitutionFinanciereRepository';
import { PrismaClient } from '@prisma/client';

export class PrismaInstitutionFinanciereRepository implements InstitutionFinanciereRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(institution: InstitutionFinanciere): Promise<InstitutionFinanciere> {
    // @ts-expect-error - Prisma client types are not correctly generated
    return this.prisma.institutionFinanciere.create({
      data: {
        nom: institution.nom,
        type: institution.type,
        description: institution.description,
        siteWeb: institution.siteWeb,
        logo: institution.logo ?? null,
        contactNom: institution.contactNom ?? null,
        contactEmail: institution.contactEmail ?? null,
        contactTelephone: institution.contactTelephone ?? null,
        regionsDesservies: institution.regionsDesservies,
      },
    });
  }

  async findById(id: string): Promise<InstitutionFinanciere | null> {
    // @ts-expect-error - Prisma client types are not correctly generated
    return this.prisma.institutionFinanciere.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<InstitutionFinanciere[]> {
    // @ts-expect-error - Prisma client types are not correctly generated
    return this.prisma.institutionFinanciere.findMany();
  }

  async update(
    id: string,
    institution: Partial<InstitutionFinanciere>
  ): Promise<InstitutionFinanciere | null> {
    // @ts-expect-error - Prisma client types are not correctly generated
    return this.prisma.institutionFinanciere.update({
      where: { id },
      data: institution,
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      // @ts-expect-error - Prisma client types are not correctly generated
      await this.prisma.institutionFinanciere.delete({
        where: { id },
      });
      return true;
    } catch {
      // Error is intentionally ignored as we just return false
      return false;
    }
  }
}
