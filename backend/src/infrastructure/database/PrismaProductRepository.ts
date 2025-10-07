import { PrismaClient, type Product as PrismaProduct, type Prisma } from '@prisma/client';
import { Product } from '@/domain/entities/Product';

import type { ProductRepository } from '@/domain/repositories/ProductRepository';
import type { ProductType } from '@/domain/entities/types/ProductType';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';

const prisma = new PrismaClient();

function toDomain(p: PrismaProduct): Product {
  return new Product(
    p.id,
    p.designation,
    Number(p.montantMin),
    Number(p.montantMax),
    p.type as ProductType,
    p.modesRemboursement as RemboursementMode,
    p.institutionId,
    p.zones?.[0] ?? '', // array → scalaire
    p.createdAt,
    p.updatedAt
  );
}

export class PrismaProductRepository implements ProductRepository {
  async findByInstitution(institutionId: string): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      where: { institutionId },
      orderBy: [{ designation: 'asc' }],
    });
    return rows.map(toDomain);
  }

  async findByFilters(
    institutionId: string,
    types?: ProductType[],
    zoneCodes?: string[],
    fromDate?: Date
  ): Promise<Product[]> {
    const where: Prisma.ProductWhereInput = { institutionId };

    if (types?.length) {
      where.type = { in: types };
    }
    if (zoneCodes?.length) {
      where.zones = { hasSome: zoneCodes };
    }
    if (fromDate instanceof Date && !isNaN(fromDate.getTime())) {
      where.createdAt = { gte: fromDate };
    }

    const rows = await prisma.product.findMany({
      where,
      orderBy: [{ designation: 'asc' }],
    });

    return rows.map(toDomain);
  }

  async institutionExists(institutionId: string): Promise<boolean> {
    const row = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { id: true },
    });
    return !!row;
  }
}
