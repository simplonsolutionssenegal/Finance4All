// src/infrastructure/database/PrismaProductRepository.ts
import { type PrismaClient } from '@prisma/client';
import { prisma } from './prisma';
import { type ProductRepository } from '@/domain/repositories/ProductRepository';
import {
  type Product,
  type ProductFilter,
  type PaginationOptions,
  type PaginatedResult,
  type ProductType,
} from '@/domain/entities/Product';
import { logger } from '@/utils/logger';

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  async findById(id: string): Promise<Product | null> {
    try {
      const product = await this.db.product.findUnique({
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

  async findAll(
    filters: ProductFilter,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Product>> {
    try {
      // Construction des filtres Prisma
      const where: any = {};

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

      // Compter le total
      const total = await this.db.product.count({ where });

      // Récupérer les données paginées
      const products = await this.db.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      });

      return {
        data: products.map(p => this.mapToDomain(p)),
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages: Math.ceil(total / pagination.limit),
        },
      };
    } catch (error) {
      logger.error('Erreur lors de la recherche de produits', {
        error: error as unknown,
        filters,
        pagination,
      });
      throw error;
    }
  }

  async create(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const product = await this.db.product.create({
        data: {
          designation: productData.designation,
          type: productData.type as any, // Prisma enum
          montantMinimum: productData.montantMinimum,
          montantMaximum: productData.montantMaximum,
          remboursement: productData.remboursement as any,
          conditionsEligibilite: productData.conditionsEligibilite as any,
        },
      });

      logger.info('Produit créé avec succès', { productId: product.id });
      return this.mapToDomain(product);
    } catch (error) {
      logger.error('Erreur lors de la création de produit', {
        error: error as unknown,
        productData,
      });
      throw error;
    }
  }

  async update(id: string, productData: Partial<Product>): Promise<Product | null> {
    try {
      // Vérifier que le produit existe
      const existing = await this.db.product.findUnique({ where: { id } });
      if (!existing) {
        return null;
      }

      const updateData: any = {};

      if (productData.designation !== undefined) {
        updateData.designation = productData.designation;
      }
      if (productData.type !== undefined) {
        updateData.type = productData.type;
      }
      if (productData.montantMinimum !== undefined) {
        updateData.montantMinimum = productData.montantMinimum;
      }
      if (productData.montantMaximum !== undefined) {
        updateData.montantMaximum = productData.montantMaximum;
      }
      if (productData.remboursement !== undefined) {
        updateData.remboursement = productData.remboursement;
      }
      if (productData.conditionsEligibilite !== undefined) {
        updateData.conditionsEligibilite = productData.conditionsEligibilite;
      }

      const product = await this.db.product.update({
        where: { id },
        data: updateData,
      });

      logger.info('Produit mis à jour avec succès', { productId: id });
      return this.mapToDomain(product);
    } catch (error) {
      logger.error('Erreur lors de la mise à jour de produit', {
        error: error as unknown,
        productId: id,
      });
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.db.product.delete({
        where: { id },
      });

      logger.info('Produit supprimé avec succès', { productId: id });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        // Produit non trouvé
        return false;
      }

      logger.error('Erreur lors de la suppression de produit', {
        error: error as unknown,
        productId: id,
      });
      throw error;
    }
  }

  async findByType(type: ProductType): Promise<Product[]> {
    try {
      const products = await this.db.product.findMany({
        where: { type: type as any },
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

  private mapToDomain(prismaProduct: any): Product {
    return {
      id: prismaProduct.id,
      designation: prismaProduct.designation,
      type: prismaProduct.type as ProductType,
      montantMinimum: prismaProduct.montantMinimum,
      montantMaximum: prismaProduct.montantMaximum,
      remboursement: prismaProduct.remboursement,
      conditionsEligibilite: prismaProduct.conditionsEligibilite,
      createdAt: prismaProduct.createdAt,
      updatedAt: prismaProduct.updatedAt,
    };
  }
}
