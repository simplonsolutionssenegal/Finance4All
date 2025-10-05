import {
  PrismaClient,
  type InstitutionService as PrismaInstitutionService,
  type Prisma,
} from '@prisma/client';
import { InstitutionService } from '@/domain/entities/InstitutionService';

import type { ServiceRepository } from '@/domain/repositories/ServiceRepository';
import type { ServiceType } from '@/domain/entities/types/InstitutionServiceType';
import type { RemboursementMode } from '@/domain/entities/types/RemboursementMode';

const prisma = new PrismaClient();

function toDomain(p: PrismaInstitutionService): InstitutionService {
  return new InstitutionService(
    p.id,
    p.designation,
    Number(p.montantMin),
    Number(p.montantMax),
    p.type as ServiceType,
    p.modesRemboursement as RemboursementMode,
    p.institutionId,
    p.zones?.[0] ?? '', // array → scalaire
    p.createdAt,
    p.updatedAt
  );
}

export class PrismaServiceRepository implements ServiceRepository {
  async findByInstitution(institutionId: string): Promise<InstitutionService[]> {
    const rows = await prisma.institutionService.findMany({
      where: { institutionId },
      orderBy: [{ designation: 'asc' }],
    });
    return rows.map(toDomain);
  }

  async findByFilters(
    institutionId: string,
    types?: ServiceType[],
    zoneCodes?: string[],
    fromDate?: Date
  ): Promise<InstitutionService[]> {
    const where: Prisma.InstitutionServiceWhereInput = { institutionId };

    if (types?.length) {
      where.type = { in: types };
    }
    if (zoneCodes?.length) {
      where.zones = { hasSome: zoneCodes }; // au moins une des zones demandées
    }
    if (fromDate instanceof Date && !isNaN(fromDate.getTime())) {
      where.createdAt = { gte: fromDate };
    }

    const rows = await prisma.institutionService.findMany({
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
