import { PrismaClient, type Product as PrismaProduct, type Prisma } from '@prisma/client';
import { Service } from '@/domain/entities/Service';

import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { ServiceType } from '@/domain/entities/types/ServiceType';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';

const prisma = new PrismaClient();

function toDomain(p: PrismaProduct): Service {
  return new Service(
    p.id,
    p.designation,
    Number(p.montantMin),
    Number(p.montantMax),
    p.type as ServiceType,
    p.modesRemboursement as RemboursementMode,
    p.institutionId,
    p.zoneId,
    p.createdAt,
    p.updatedAt
  );
}

export class PrismaServiceRepository implements ServiceRepository {
  async findByInstitution(institutionId: number): Promise<Service[]> {
    const rows = await prisma.product.findMany({
      where: { institutionId },
      orderBy: [{ designation: 'asc' }],
    });
    return rows.map(toDomain);
  }

  async findByFilters(
    institutionId: number,
    types?: ServiceType[],
    zoneId?: number,
    fromDate?: Date
  ): Promise<Service[]> {
    const where: Prisma.ProductWhereInput = { institutionId };

    if (Array.isArray(types) && types.length > 0) {
      where.type = { in: types };
    }
    if (Number.isFinite(zoneId)) {
      where.zoneId = zoneId;
    }

    if (fromDate instanceof Date) {
      where.createdAt = { gte: fromDate };
    }

    const rows = await prisma.product.findMany({
      where,
      orderBy: [{ designation: 'asc' }],
    });
    return rows.map(toDomain);
  }
}
