import { Service, TypeService } from '@/domain/institutions/entities/Service';
import {
  FraisGratuit,
  FraisFixes,
  FraisPourcentage,
  type Frais,
} from '@/domain/institutions/entities/Frais';
import { EntityId } from '@/domain/shared/EntityId';
import type {
  Prisma,
  PrismaClient,
  Service as PrismaService,
  TypeService as PrismaTypeService,
  Institution as PrismaInstitution,
} from '@prisma/client';
import type { ServiceRepository } from '@/domain/institutions/ports/out/ServiceRepository';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';
import type { ComparedServiceDTO } from '@/domain/institutions/value-objects/ComparedServiceDTO';

type FraisData = {
  type: 'FREE' | 'FIX' | 'POURCENTAGE';
  amount?: number;
  rate?: number;
  fxSurcharge?: number;
  fraisChange?: FraisChangeData;
  cap?: number;
  floor?: number;
};

type FraisChangeData = {
  fxSurcharge: number;
  devise: string;
};

type ServiceWithInstitution = PrismaService & { institution: PrismaInstitution };

export class PrismaServiceRepository implements ServiceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async update(service: Service): Promise<Service> {
    const serviceData = this.toPrismaUpdateData(service);

    const updated = await this.prisma.service.update({
      where: { id: service.id.getValue() },
      data: serviceData,
    });

    return this.toDomain(updated);
  }

  async findById(id: string): Promise<Service | null> {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    return service ? this.toDomain(service) : null;
  }

  async findByInstitutionId(institutionId: string): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
    });

    return services.map(s => this.toDomain(s));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.service.delete({
      where: { id },
    });
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<ComparedServiceDTO>> {
    const skip = (params.page - 1) * params.limit;

    const where: Prisma.ServiceWhereInput = {};
    const typeFilter = (params as unknown as { type?: TypeService }).type;
    if (typeFilter) {
      where.type = this.mapTypeServiceToPrismaType(typeFilter) as PrismaTypeService;
    }

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          institution: true,
        },
      }),
      this.prisma.service.count({ where }),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: services.map(s =>
        this.mapServiceWithInstitutionToComparedDTO(s as ServiceWithInstitution)
      ),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  async findByName(name: string): Promise<Service[]> {
    const services = await this.prisma.service.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return services.map(s => this.toDomain(s));
  }

  async findAllByInstitution(
    institutionId: string,
    params: PaginationParams
  ): Promise<PaginatedResult<Service[]>> {
    const skip = (params.page - 1) * params.limit;

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where: { institutionId },
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.service.count({
        where: { institutionId },
      }),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: [services.map(s => this.toDomain(s))],
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  // 🔥 NOUVELLE MÉTHODE : utilisée par le use case de comparaison
  async findForComparison(ids: string[]): Promise<ComparedServiceDTO[]> {
    if (ids.length === 0) return [];

    const services = await this.prisma.service.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        institution: true,
      },
    });

    return services.map(s =>
      this.mapServiceWithInstitutionToComparedDTO(s as ServiceWithInstitution)
    );
  }

  private mapServiceWithInstitutionToComparedDTO(
    prismaService: ServiceWithInstitution
  ): ComparedServiceDTO {
    const domainService = this.mapServiceToDomain(prismaService);
    const dto = domainService.toDTO();

    return {
      ...dto,
      institution: {
        id: prismaService.institution.id,
        name: prismaService.institution.name,
        logoUrl: prismaService.institution.logoUrl,
      },
    };
  }

  private mapServiceToDomain(prismaService: PrismaService & { institution?: any }): Service {
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

  private toDomain(prismaService: PrismaService): Service {
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
      return new FraisFixes(
        fraisData.amount,
        fraisData.rate,
        fraisData.fraisChange
          ? {
              fxSurcharge: fraisData.fraisChange.fxSurcharge,
              devise: fraisData.fraisChange.devise,
            }
          : undefined
      );
    }

    if (fraisData.type === 'POURCENTAGE' && fraisData.rate !== undefined) {
      return new FraisPourcentage(fraisData.rate, fraisData.cap, fraisData.floor);
    }

    return new FraisGratuit();
  }

  private toPrismaData(service: Service, institutionId: string): Prisma.ServiceCreateInput {
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
      institution: {
        connect: { id: institutionId },
      },
    };
  }

  private toPrismaUpdateData(service: Service): Prisma.ServiceUpdateInput {
    return {
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
      const fraisData: FraisData = {
        type: 'FIX',
        amount: frais.amount,
        rate: frais.rate,
      };

      if (frais.fraisChange) {
        fraisData.fraisChange = {
          fxSurcharge: frais.fraisChange.fxSurcharge,
          devise: frais.fraisChange.devise,
        };
      }

      return fraisData;
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
