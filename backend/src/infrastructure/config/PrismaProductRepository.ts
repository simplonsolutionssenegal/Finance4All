// src/infrastructure/database/PrismaProductRepository.ts
import type { PrismaClient, Prisma } from '@prisma/client';

import { prisma } from '@/infrastructure/config/prismaClient';
import { type ProductRepository } from '@/domain/repositories/ProductRepository';
import {
  type Product,
  type ProductFilter,
  type ProductType,
  type RemboursementInfo,
  type ConditionsEligibilite,
} from '@/domain/entities/Product';
import { logger } from '@/infrastructure/utils/logger';

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async findById(id: string): Promise<Product | null> {
    try {
      const product = await this.db.service.findUnique({
        where: { id },
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

  async findAll(filters: ProductFilter): Promise<Product[]> {
    try {
      // Construction des filtres Prisma
      const where: Record<string, unknown> = {};

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.designation) {
        where.designation = {
          contains: filters.designation,
          mode: 'insensitive',
        };
      }

      if (filters.montantMinimum) {
        where.montantMaximum = {
          gte: filters.montantMinimum,
        };
      }

      if (filters.montantMaximum) {
        where.montantMinimum = {
          lte: filters.montantMaximum,
        };
      }

      const products = await this.db.service.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return products.map((p: Prisma.ServiceGetPayload<{}>) => this.mapToDomain(p));
    } catch (error) {
      logger.error('Erreur lors de la recherche de produits', {
        error: error as unknown,
        filters,
      });
      throw error;
    }
  }

  async findByType(type: ProductType): Promise<Product[]> {
    try {
      const products = await this.db.service.findMany({
        where: { type: type.toLowerCase() as any },
        orderBy: { createdAt: 'desc' },
      });

      return products.map((p: Prisma.ServiceGetPayload<{}>) => this.mapToDomain(p));
    } catch (error) {
      logger.error('Erreur lors de la recherche par type', {
        error: error as unknown,
        type,
      });
      throw error;
    }
  }

  private mapToDomain(prismaProduct: Prisma.ServiceGetPayload<{}>): Product {
    return {
      id: prismaProduct.id,
      designation: prismaProduct.designation,
      type: prismaProduct.type as ProductType,
      montantMinimum: prismaProduct.montantMinimum,
      montantMaximum: prismaProduct.montantMaximum,
      remboursement: prismaProduct.remboursement as unknown as RemboursementInfo,
      conditionsEligibilite:
        prismaProduct.conditionsEligibilite as unknown as ConditionsEligibilite,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
    };
  }
}
