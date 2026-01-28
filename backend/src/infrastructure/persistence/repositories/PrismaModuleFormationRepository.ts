//infrastructure/persistence/repositories/PrismaModuleFormationRepository.ts

import type { Prisma, Module as PrismaModuleModel } from '@prisma/client';
// eslint-disable-next-line no-duplicate-imports
import { type PrismaClient } from '@prisma/client';

import { EntityId } from '@/domain/shared/EntityId';

import type { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';
// eslint-disable-next-line no-duplicate-imports
import { Module } from '@/domain/formations/entities/ModuleFormation';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';

type PrismaModuleData = PrismaModuleModel;
export class PrismaModuleFormationRepository implements ModuleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(module: Module): Promise<Module> {
    const data = this.toPrismaData(module);
    const saved = await this.prisma.module.create({
      data,
    });

    return this.toDomain(saved);
  }
  async findByTitle(title: string): Promise<Module | null> {
    const module = await this.prisma.module.findFirst({
      where: {
        title: {
          equals: title,
        },
      },
    });

    return module ? this.toDomain(module) : null;
  }
  async findByThematic(thematic: string): Promise<Module | null> {
    const module = await this.prisma.module.findFirst({
      where: {
        thematics: {
          equals: thematic,
        },
      },
    });

    return module ? this.toDomain(module) : null;
  }

  async findAll(params: PaginationParams): Promise<PaginatedResult<Module>> {
    const skip = (params.page - 1) * params.limit;

    const [modules, total] = await Promise.all([
      this.prisma.module.findMany({
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.module.count(),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      data: modules.map(i => this.toDomain(i)),
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
      },
    };
  }

  private toDomain(prismaModule: PrismaModuleData): Module {
    return new Module({
      id: EntityId.from(prismaModule.id),
      title: prismaModule.title,
      imageMediaId: prismaModule.imageMediaId || null,
      description: prismaModule.description,
      thematics: prismaModule.thematics || null,
      difficultyLevel: (prismaModule.difficultyLevel as DifficultyLevel) || undefined,
      estimatedDuration: prismaModule.estimatedDuration || 0,
      status: prismaModule.status as ModuleStatus,
      createdAt: prismaModule.createdAt,
      updatedAt: prismaModule.updatedAt,
    });
  }
  private toPrismaData(module: Module): Prisma.ModuleCreateInput {
    return {
      id: module.id.getValue(),
      title: module.title,
      description: module.description,
      imageMediaId: module.imageMediaId,
      thematics: module.thematics || undefined,
      difficultyLevel: module.difficultyLevel,
      estimatedDuration: module.estimatedDuration,
      status: module.status as ModuleStatus,
    };
  }
}
