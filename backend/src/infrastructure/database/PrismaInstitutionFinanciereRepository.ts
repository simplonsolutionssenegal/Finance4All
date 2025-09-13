import { InstitutionFinanciere } from '../../domain/entities/InstitutionFinanciere';
import { InstitutionFinanciereRepository } from '../../domain/repositories/InstitutionFinanciereRepository';
import { PrismaClient } from '@prisma/client';

// NOTE: Prisma client generated types should give us strong typing. If eslint still
// reports unsafe-* rules (seen when generation lags), we explicitly cast to the
// domain entity interface to satisfy @typescript-eslint/no-unsafe-* rules.

export class PrismaInstitutionFinanciereRepository implements InstitutionFinanciereRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(institution: InstitutionFinanciere): Promise<InstitutionFinanciere> {
    const created = await this.prisma.institutionFinanciere.create({
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
    return created as unknown as InstitutionFinanciere;
  }

  async findById(id: string): Promise<InstitutionFinanciere | null> {
    const record = await this.prisma.institutionFinanciere.findUnique({
      where: { id },
    });
    return (record as unknown as InstitutionFinanciere) ?? null;
  }

  async findAll(): Promise<InstitutionFinanciere[]> {
    const list = await this.prisma.institutionFinanciere.findMany();
    return list as unknown as InstitutionFinanciere[];
  }

  async findPaginated(skip: number, take: number): Promise<{ data: InstitutionFinanciere[]; total: number; }> {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.institutionFinanciere.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.institutionFinanciere.count(),
    ]);
    return { data: data as unknown as InstitutionFinanciere[], total };
  }

  async update(
    id: string,
    institution: Partial<InstitutionFinanciere>,
  ): Promise<InstitutionFinanciere | null> {
    try {
      const updated = await this.prisma.institutionFinanciere.update({
        where: { id },
        data: institution,
      });
      return updated as unknown as InstitutionFinanciere;
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.institutionFinanciere.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }
}
