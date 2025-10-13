// src/infrastructure/database/PrismaProductRepository.ts
import type { PrismaClient, Prisma } from '@prisma/client';
// eslint-disable-next-line no-duplicate-imports
import { TypeService as PrismaTypeService } from '@prisma/client';

import { prisma } from '@/infrastructure/config/prismaClient';
import { type ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { Service, ServiceFilter } from '@/domain/entities/Service';
import { TypeService as DomainTypeService } from '@/domain/institutions/entities/Service';
import { logger } from '@/infrastructure/utils/logger';

// Mapping entre les enums Prisma et Domain
const mapPrismaToDomainType = (prismaType: PrismaTypeService): DomainTypeService => {
  const mapping: Record<PrismaTypeService, DomainTypeService> = {
    [PrismaTypeService.PAIEMENT_MARCHAND]: DomainTypeService.PAIEMENT_MARCHAND,
    [PrismaTypeService.ACHAT_CREDIT]: DomainTypeService.ACHAT_CREDIT,
    [PrismaTypeService.PAIEMENT_FACTURES]: DomainTypeService.PAIEMENT_FACTURES,
    [PrismaTypeService.DEPOT_SIMPLE]: DomainTypeService.DEPOT_SIMPLE,
    [PrismaTypeService.DEPOT_RETRAIT_SIMPLE]: DomainTypeService.DEPOT_RETRAIT_SIMPLE,
    [PrismaTypeService.RETRAIT_SIMPLE]: DomainTypeService.RETRAIT_SIMPLE,
    [PrismaTypeService.TRANSFERT_ARGENT]: DomainTypeService.TRANSFERT_ARGENT,
    [PrismaTypeService.BANQUE_WALLET]: DomainTypeService.BANQUE_WALLET,
    [PrismaTypeService.WALLET_BANQUE]: DomainTypeService.WALLET_BANQUE,
    [PrismaTypeService.EPARGNE]: DomainTypeService.EPARGNE,
    [PrismaTypeService.CREDIT]: DomainTypeService.CREDIT,
    [PrismaTypeService.ASSURANCE]: DomainTypeService.ASSURANCE,
    [PrismaTypeService.AUTRES]: DomainTypeService.AUTRES,
  };
  return mapping[prismaType];
};

const mapDomainToPrismaType = (domainType: DomainTypeService): PrismaTypeService => {
  const mapping: Record<DomainTypeService, PrismaTypeService> = {
    [DomainTypeService.PAIEMENT_MARCHAND]: PrismaTypeService.PAIEMENT_MARCHAND,
    [DomainTypeService.ACHAT_CREDIT]: PrismaTypeService.ACHAT_CREDIT,
    [DomainTypeService.PAIEMENT_FACTURES]: PrismaTypeService.PAIEMENT_FACTURES,
    [DomainTypeService.DEPOT_SIMPLE]: PrismaTypeService.DEPOT_SIMPLE,
    [DomainTypeService.DEPOT_RETRAIT_SIMPLE]: PrismaTypeService.DEPOT_RETRAIT_SIMPLE,
    [DomainTypeService.RETRAIT_SIMPLE]: PrismaTypeService.RETRAIT_SIMPLE,
    [DomainTypeService.TRANSFERT_ARGENT]: PrismaTypeService.TRANSFERT_ARGENT,
    [DomainTypeService.BANQUE_WALLET]: PrismaTypeService.BANQUE_WALLET,
    [DomainTypeService.WALLET_BANQUE]: PrismaTypeService.WALLET_BANQUE,
    [DomainTypeService.EPARGNE]: PrismaTypeService.EPARGNE,
    [DomainTypeService.CREDIT]: PrismaTypeService.CREDIT,
    [DomainTypeService.ASSURANCE]: PrismaTypeService.ASSURANCE,
    [DomainTypeService.AUTRES]: PrismaTypeService.AUTRES,
  };
  return mapping[domainType];
};

export class PrismaServiceRepository implements ServiceRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async findById(id: string): Promise<Service | null> {
    try {
      const product = await this.db.service.findUnique({
        where: { id },
        include: {
          institution: true,
        },
      });

      return product ? this.mapToDomain(product) : null;
    } catch (error) {
      logger.error('Erreur lors de la recherche de produit par ID', {
        error: error as unknown,
        productId: id,
      });
      throw error;
    }
  }

  async findAll(filters: ServiceFilter): Promise<Service[]> {
    try {
      // Construction des filtres Prisma
      const where: Record<string, unknown> = {};

      if (filters.type) {
        where.type = mapDomainToPrismaType(filters.type);
      }

      if (filters.name) {
        where.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }

      if (filters.institutionId) {
        where.institutionId = filters.institutionId;
      }

      const products = await this.db.service.findMany({
        where,
        include: {
          institution: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return products.map(p => this.mapToDomain(p));
    } catch (error) {
      logger.error('Erreur lors de la recherche de produits', {
        error: error as unknown,
        filters,
      });
      throw error;
    }
  }

  async findByType(type: DomainTypeService): Promise<Service[]> {
    try {
      const products = await this.db.service.findMany({
        where: { type: mapDomainToPrismaType(type) },
        include: {
          institution: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return products.map(p => this.mapToDomain(p));
    } catch (error) {
      logger.error('Erreur lors de la recherche par type', {
        error: error as unknown,
        type,
      });
      throw error;
    }
  }

  private mapToDomain(
    prismaService: Prisma.ServiceGetPayload<{ include: { institution: true } }>
  ): Service {
    return {
      id: prismaService.id,
      name: prismaService.name,
      longName: prismaService.longName,
      type: mapPrismaToDomainType(prismaService.type),
      frais: prismaService.frais as Record<string, unknown>,
      conditionAccess: prismaService.conditionAccess,
      plafonds: prismaService.plafonds,
      infrastructureAccess: prismaService.infrastructureAccess,
      institutionId: prismaService.institutionId,
      institution: prismaService.institution
        ? {
            id: prismaService.institution.id,
            name: prismaService.institution.name || '',
          }
        : undefined,
      createdAt: prismaService.createdAt,
      updatedAt: prismaService.updatedAt,
    };
  }
}
