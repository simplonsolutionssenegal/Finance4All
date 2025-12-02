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

type FraisChangeData = {
  fxSurcharge: number;
  devise: string;
};

type FraisData = {
  type: 'FREE' | 'FIX' | 'POURCENTAGE';
  amount?: number;
  rate?: number;
  fxSurcharge?: number;
  fraisChange?: FraisChangeData;
  cap?: number;
  floor?: number;
};

type ServiceWithInstitution = PrismaService & { institution: PrismaInstitution };

class ServiceTypeMapper {
  private static readonly TYPE_MAP: Record<TypeService, PrismaTypeService> = {
    [TypeService.PAIEMENT_MARCHAND]: 'PAIEMENT_MARCHAND' as PrismaTypeService,
    [TypeService.ACHAT_CREDIT]: 'ACHAT_CREDIT' as PrismaTypeService,
    [TypeService.PAIEMENT_FACTURES]: 'PAIEMENT_FACTURES' as PrismaTypeService,
    [TypeService.DEPOT_SIMPLE]: 'DEPOT_SIMPLE' as PrismaTypeService,
    [TypeService.DEPOT_RETRAIT_SIMPLE]: 'DEPOT_RETRAIT_SIMPLE' as PrismaTypeService,
    [TypeService.RETRAIT_SIMPLE]: 'RETRAIT_SIMPLE' as PrismaTypeService,
    [TypeService.TRANSFERT_ARGENT]: 'TRANSFERT_ARGENT' as PrismaTypeService,
    [TypeService.BANQUE_WALLET]: 'BANQUE_WALLET' as PrismaTypeService,
    [TypeService.WALLET_BANQUE]: 'WALLET_BANQUE' as PrismaTypeService,
    [TypeService.EPARGNE]: 'EPARGNE' as PrismaTypeService,
    [TypeService.CREDIT]: 'CREDIT' as PrismaTypeService,
    [TypeService.ASSURANCE]: 'ASSURANCE' as PrismaTypeService,
    [TypeService.AUTRES]: 'AUTRES' as PrismaTypeService,
  };
  private static readonly REVERSE_MAP = Object.entries(this.TYPE_MAP).reduce(
    (acc, [key, value]) => {
      acc[value] = key as TypeService;
      return acc;
    },
    {} as Record<string, TypeService>
  );

  static toPrisma(type: TypeService): PrismaTypeService {
    return this.TYPE_MAP[type] || ('AUTRES' as PrismaTypeService);
  }

  static toDomain(prismaType: PrismaTypeService | string): TypeService {
    return this.REVERSE_MAP[prismaType] || TypeService.AUTRES;
  }
}

class FraisMapper {
  private static mapFraisChangeData(
    fraisChange?: FraisChangeData | null
  ): FraisChangeData | undefined {
    if (!fraisChange) return undefined;
    return {
      fxSurcharge: fraisChange.fxSurcharge,
      devise: fraisChange.devise,
    };
  }

  static toDomain(fraisData: FraisData): Frais {
    if (!fraisData || fraisData.type === 'FREE') {
      return new FraisGratuit();
    }

    if (fraisData.type === 'FIX' && fraisData.amount !== undefined) {
      return new FraisFixes(
        fraisData.amount,
        fraisData.rate,
        this.mapFraisChangeData(fraisData.fraisChange)
      );
    }

    if (fraisData.type === 'POURCENTAGE' && fraisData.rate !== undefined) {
      return new FraisPourcentage(fraisData.rate, fraisData.cap, fraisData.floor);
    }

    return new FraisGratuit();
  }

  static toPrisma(frais: Frais): FraisData {
    if (frais instanceof FraisGratuit) {
      return { type: 'FREE' };
    }

    if (frais instanceof FraisFixes) {
      const fraisData: FraisData = {
        type: 'FIX',
        amount: frais.amount,
        rate: frais.rate,
      };

      const mappedFraisChange = this.mapFraisChangeData(frais.fraisChange);
      if (mappedFraisChange) {
        fraisData.fraisChange = mappedFraisChange;
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
    const where: Prisma.ServiceWhereInput = {};
    const typeFilter = (params as any).type as TypeService | undefined;

    if (typeFilter) {
      where.type = ServiceTypeMapper.toPrisma(typeFilter);
    }

    return this.findPaginated<ServiceWithInstitution, ComparedServiceDTO>(
      params,
      {
        where,
        orderBy: { createdAt: 'desc' },
        include: { institution: true },
      },
      s => this.mapServiceWithInstitutionToComparedDTO(s)
    );
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
  ): Promise<PaginatedResult<Service>> {
    return this.findPaginated<PrismaService, Service>(
      params,
      {
        where: { institutionId },
        orderBy: { createdAt: 'desc' },
      },
      s => this.toDomain(s)
    );
  }

  async findForComparison(ids: string[]): Promise<ComparedServiceDTO[]> {
    if (ids.length === 0) return [];

    const services = await this.prisma.service.findMany({
      where: { id: { in: ids } },
      include: { institution: true },
    });

    return services.map(s =>
      this.mapServiceWithInstitutionToComparedDTO(s as ServiceWithInstitution)
    );
  }

  private async findPaginated<TPrismaResult, TMappedResult>(
    params: PaginationParams,
    prismaQueryArgs: Prisma.ServiceFindManyArgs,
    mapper: (item: TPrismaResult) => TMappedResult
  ): Promise<PaginatedResult<TMappedResult>> {
    const skip = this.calculateSkip(params);
    const queryWithPagination = {
      ...prismaQueryArgs,
      skip,
      take: params.limit,
    };

    const [services, total] = await Promise.all([
      this.prisma.service.findMany(queryWithPagination),
      this.prisma.service.count({ where: prismaQueryArgs.where }),
    ]);

    return {
      data: services.map(s => mapper(s as unknown as TPrismaResult)),
      pagination: this.buildPaginationMetadata(params, total),
    };
  }

  private calculateSkip(params: PaginationParams): number {
    return (params.page - 1) * params.limit;
  }

  private buildPaginationMetadata(params: PaginationParams, total: number) {
    return {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    };
  }

  private toDomain(prismaService: PrismaService): Service {
    return new Service({
      id: EntityId.from(prismaService.id),
      name: prismaService.name,
      longName: prismaService.longName,
      type: ServiceTypeMapper.toDomain(prismaService.type),
      montantMin: prismaService.montantMin ?? 0,
      montantMax: prismaService.montantMax ?? 0,
      frais: FraisMapper.toDomain(prismaService.frais as FraisData),
      conditionAccess: prismaService.conditionAccess,
      plafonds: prismaService.plafonds,
      infrastructureAccess: prismaService.infrastructureAccess,
    });
  }

  private mapServiceWithInstitutionToComparedDTO(
    prismaService: ServiceWithInstitution
  ): ComparedServiceDTO {
    const domainService = this.toDomain(prismaService);
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

  private getBasePrismaData(service: Service) {
    return {
      name: service.name,
      longName: service.longName,
      type: ServiceTypeMapper.toPrisma(service.type),
      montantMin: service.montantMin,
      montantMax: service.montantMax,
      frais: FraisMapper.toPrisma(service.frais),
      conditionAccess: service.conditionAccess,
      plafonds: service.plafonds,
      infrastructureAccess: service.infrastructureAccess,
    };
  }

  private toPrismaData(service: Service, institutionId: string): Prisma.ServiceCreateInput {
    return {
      id: service.id.getValue(),
      ...this.getBasePrismaData(service),
      institution: {
        connect: { id: institutionId },
      },
    };
  }

  private toPrismaUpdateData(service: Service): Prisma.ServiceUpdateInput {
    return this.getBasePrismaData(service);
  }
}
