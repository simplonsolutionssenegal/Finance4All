import { Institution } from '@/domain/institutions/entities/Institution';
// eslint-disable-next-line no-duplicate-imports
import type { InstitutionStatus } from '@/domain/institutions/entities/Institution';
import { Service, TypeService } from '@/domain/institutions/entities/Service';
import {
  FraisGratuit,
  FraisFixes,
  FraisPourcentage,
  type Frais,
} from '@/domain/institutions/entities/Frais';
import { EntityId } from '@/domain/shared/EntityId';
import { UrlValueObject } from '@/domain/institutions/value-objects/UrlValueObject';
import type { InstitutionTypeEnum } from '@/domain/institutions/value-objects/InstitutionType';
import type { CountryType } from '@/domain/institutions/value-objects/Country';
import type {
  Prisma,
  PrismaClient,
  Institution as PrismaInstitution,
  Service as PrismaService,
  InstitutionStatus as PrismaInstitutionStatus,
  TypeService as PrismaTypeService,
  InstitutionType as PrismaInstitutionType,
  Country as PrismaPays,
  TypeCalculation as PrismaTypeCalculation,
} from '@prisma/client';
import type { InstitutionRepository } from '@/domain/institutions/ports/out/InstitutionRepository';
import type { PaginationParams, PaginatedResult } from '@/domain/shared/Pagination';

type InstitutionWithServices = PrismaInstitution & {
  services: PrismaService[];
};

type FraisData = {
  type: 'FREE' | 'FIX' | 'POURCENTAGE';
  amount?: number;
  rate?: number;
  fxSurcharge?: number;
  cap?: number;
  floor?: number;
};

export class PrismaInstitutionRepository implements InstitutionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(institution: Institution): Promise<Institution> {
    const data = this.toPrismaData(institution);

    const saved = await this.prisma.institution.create({
      data,
      include: {
        services: true,
      },
    });

    return this.toDomain(saved);
  }

  async update(institution: Institution): Promise<Institution> {
    const institutionData = this.toPrismaData(institution);
    const services = institution.services;

    // Récupérer l'institution existante pour comparer les services
    const existingInstitution = await this.prisma.institution.findUnique({
      where: { id: institution.id.getValue() },
      include: { services: true },
    });

    const existingServiceIds = new Set(existingInstitution?.services.map(s => s.id) || []);
    const newServices = services.filter(s => !existingServiceIds.has(s.id.getValue()));

    // Mettre à jour l'institution et créer les nouveaux services
    const updated = await this.prisma.institution.update({
      where: { id: institution.id.getValue() },
      data: {
        ...institutionData,
        services: {
          create: newServices.map(service => this.mapServiceToPrisma(service)),
        },
      },
      include: {
        services: true,
      },
    });

    return this.toDomain(updated);
  }

  async findById(id: string): Promise<Institution | null> {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: {
        services: true,
      },
    });

    return institution ? this.toDomain(institution) : null;
  }

  async findByName(name: string): Promise<Institution[]> {
    const institutions = await this.prisma.institution.findMany({
      where: { name },
      include: {
        services: true,
      },
    });

    return institutions.map(i => this.toDomain(i));
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Institution>> {
    const skip = (params.page - 1) * params.limit;

    const [institutions, total] = await Promise.all([
      this.prisma.institution.findMany({
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          services: true,
        },
      }),
      this.prisma.institution.count(),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: institutions.map(i => this.toDomain(i)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  private toDomain(prismaInstitution: InstitutionWithServices): Institution {
    const services = prismaInstitution.services?.map(s => this.mapServiceToDomain(s)) || [];

    return new Institution({
      id: EntityId.from(prismaInstitution.id),
      name: prismaInstitution.name,
      description: prismaInstitution.description,
      website: UrlValueObject.from(prismaInstitution.website),
      geographicZones: prismaInstitution.geographicZones,
      logoUrl: UrlValueObject.from(prismaInstitution.logoUrl),
      status: prismaInstitution.status as InstitutionStatus,
      type: prismaInstitution.type as InstitutionTypeEnum,
      pays: prismaInstitution.pays as CountryType,
      services,
    });
  }

  private mapServiceToDomain(prismaService: PrismaService): Service {
    return new Service({
      id: EntityId.from(prismaService.id),
      name: prismaService.name,
      longName: prismaService.longName,
      type: this.mapPrismaTypeToTypeService(prismaService.type),
      montantMin: prismaService.montantMin ?? 0,
      montantMax: prismaService.montantMax ?? 0,
      frais: this.mapFraisToDomain(prismaService.frais as FraisData),
      conditionAccess: prismaService.conditionAccess,
      plafonds: prismaService.plafonds,
      infrastructureAccess: prismaService.infrastructureAccess,
    });
  }

  private mapFraisToDomain(fraisData: FraisData): Frais {
    if (!fraisData || fraisData.type === 'FREE') {
      return new FraisGratuit();
    }

    if (fraisData.type === 'FIX' && fraisData.amount !== undefined) {
      return new FraisFixes(fraisData.amount, fraisData.rate, fraisData.fxSurcharge);
    }

    if (fraisData.type === 'POURCENTAGE' && fraisData.rate !== undefined) {
      return new FraisPourcentage(fraisData.rate, fraisData.cap, fraisData.floor);
    }

    return new FraisGratuit();
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
      type: institution.type as PrismaInstitutionType,
      pays: institution.pays as PrismaPays,
    };
  }

  private mapServiceToPrisma(service: Service): Prisma.ServiceCreateWithoutInstitutionInput {
    return {
      id: service.id.getValue(),
      name: service.name,
      longName: service.longName,
      type: this.mapTypeServiceToPrismaType(service.type) as PrismaTypeService,
      montantMin: service.montantMin,
      montantMax: service.montantMax,
      frais: this.mapFraisToPrisma(service.frais),
      conditionAccess: service.conditionAccess,
      plafonds: service.plafonds,
      infrastructureAccess: service.infrastructureAccess,
    };
  }

  private mapTypeServiceToPrismaType(type: TypeService): string {
    const typeMap: Record<TypeService, string> = {
      [TypeService.PAIEMENT_MARCHAND]: 'PAIEMENT_MARCHAND',
      [TypeService.ACHAT_CREDIT]: 'ACHAT_CREDIT',
      [TypeService.PAIEMENT_FACTURES]: 'PAIEMENT_FACTURES',
      [TypeService.DEPOT_SIMPLE]: 'DEPOT_SIMPLE',
      [TypeService.DEPOT_RETRAIT_SIMPLE]: 'DEPOT_RETRAIT_SIMPLE',
      [TypeService.RETRAIT_SIMPLE]: 'RETRAIT_SIMPLE',
      [TypeService.TRANSFERT_ARGENT]: 'TRANSFERT_ARGENT',
      [TypeService.BANQUE_WALLET]: 'BANQUE_WALLET',
      [TypeService.WALLET_BANQUE]: 'WALLET_BANQUE',
      [TypeService.EPARGNE]: 'EPARGNE',
      [TypeService.CREDIT]: 'CREDIT',
      [TypeService.ASSURANCE]: 'ASSURANCE',
      [TypeService.AUTRES]: 'AUTRES',
    };
    return typeMap[type] || 'AUTRES';
  }

  private mapPrismaTypeToTypeService(prismaType: string): TypeService {
    const typeMap: Record<string, TypeService> = {
      PAIEMENT_MARCHAND: TypeService.PAIEMENT_MARCHAND,
      ACHAT_CREDIT: TypeService.ACHAT_CREDIT,
      PAIEMENT_FACTURES: TypeService.PAIEMENT_FACTURES,
      DEPOT_SIMPLE: TypeService.DEPOT_SIMPLE,
      DEPOT_RETRAIT_SIMPLE: TypeService.DEPOT_RETRAIT_SIMPLE,
      RETRAIT_SIMPLE: TypeService.RETRAIT_SIMPLE,
      TRANSFERT_ARGENT: TypeService.TRANSFERT_ARGENT,
      BANQUE_WALLET: TypeService.BANQUE_WALLET,
      WALLET_BANQUE: TypeService.WALLET_BANQUE,
      EPARGNE: TypeService.EPARGNE,
      CREDIT: TypeService.CREDIT,
      ASSURANCE: TypeService.ASSURANCE,
      AUTRES: TypeService.AUTRES,
    };
    return typeMap[prismaType] || TypeService.AUTRES;
  }

  private mapFraisToPrisma(frais: Frais): FraisData {
    if (frais instanceof FraisGratuit) {
      return { type: 'FREE' };
    }

    if (frais instanceof FraisFixes) {
      return {
        type: 'FIX',
        amount: frais.amount,
        rate: frais.rate,
        fxSurcharge: frais.fxSurcharge,
      };
    }

    if (frais instanceof FraisPourcentage) {
      return {
        type: 'POURCENTAGE',
        rate: frais.rate,
        cap: frais.cap,
        floor: frais.floor,
      };
    }

    return { type: 'FREE' };
  }
}
