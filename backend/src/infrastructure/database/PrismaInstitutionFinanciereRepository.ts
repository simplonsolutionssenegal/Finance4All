import { InstitutionFinanciere } from '@/domain/entities/InstitutionFinanciere';
import { ContactPerson } from '@/domain/entities/ContactPerson';
import { InstitutionFinanciereRepository } from '@/domain/repositories/InstitutionFinanciereRepository';
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
        contactNom: institution.contact?.nom ?? null,
        contactEmail: institution.contact?.email ?? null,
        contactTelephone: institution.contact?.telephone ?? null,
        regionsDesservies: institution.regionsDesservies,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<InstitutionFinanciere | null> {
    const record = await this.prisma.institutionFinanciere.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findAll(): Promise<InstitutionFinanciere[]> {
    const list = await this.prisma.institutionFinanciere.findMany();
    return list.map(r => this.toDomain(r));
  }

  async findPaginated(skip: number, take: number): Promise<{ data: InstitutionFinanciere[]; total: number; }> {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.institutionFinanciere.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.institutionFinanciere.count(),
    ]);
    return { data: data.map(d => this.toDomain(d)), total };
  }

  async update(
    id: string,
    institution: Partial<InstitutionFinanciere>,
  ): Promise<InstitutionFinanciere | null> {
    try {
      const updateData: Record<string, unknown> = {};
      if (institution.nom !== undefined) updateData.nom = institution.nom;
      if (institution.type !== undefined) updateData.type = institution.type;
      if (institution.description !== undefined) updateData.description = institution.description;
      if (institution.siteWeb !== undefined) updateData.siteWeb = institution.siteWeb;
      if (institution.logo !== undefined) updateData.logo = institution.logo;
      if (institution.regionsDesservies !== undefined) updateData.regionsDesservies = institution.regionsDesservies;
      if (institution.contact) {
        updateData.contactNom = institution.contact.nom;
        updateData.contactEmail = institution.contact.email ?? null;
        updateData.contactTelephone = institution.contact.telephone ?? null;
      }
      if (institution.contact === null) {
        updateData.contactNom = null;
        updateData.contactEmail = null;
        updateData.contactTelephone = null;
      }

      const updated = await this.prisma.institutionFinanciere.update({ where: { id }, data: updateData });
      return this.toDomain(updated);
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
  // Helper mapping function
  private toDomain(record: PrismaInstitutionRecord): InstitutionFinanciere {
    const contact: ContactPerson | null = record.contactNom
      ? {
          nom: record.contactNom,
          email: record.contactEmail,
          telephone: record.contactTelephone,
        }
      : null;

    return {
      id: record.id,
      nom: record.nom,
      type: record.type,
      description: record.description,
      siteWeb: record.siteWeb,
      logo: record.logo,
      contact,
      regionsDesservies: record.regionsDesservies,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}

interface PrismaInstitutionRecord {
  id: string;
  nom: string;
  type: string;
  description: string;
  siteWeb: string;
  logo: string | null;
  contactNom: string | null;
  contactEmail: string | null;
  contactTelephone: string | null;
  regionsDesservies: string[];
  createdAt: Date;
  updatedAt: Date;
}

// (previous implementation moved inside class)
