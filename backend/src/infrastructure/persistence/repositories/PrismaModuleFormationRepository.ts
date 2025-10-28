//infrastructure/persistence/repositories/PrismaModuleFormationRepository.ts

import { type PrismaClient } from '@prisma/client';

import { EntityId } from '@/domain/shared/EntityId';
import type { Thematic } from '@/domain/formations/value-objects/Thematic';

import type { DifficultyLevel, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';
// eslint-disable-next-line no-duplicate-imports
import { Module } from '@/domain/formations/entities/ModuleFormation';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';

type PrismaModule = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  thematics: string[];
  difficultyLevel: string | null;
  estimatedDuration: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

export class PrismaModuleFormationRepository implements ModuleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(module: Module): Promise<Module> {
    const created = await this.prisma.module.create({
      data: {
        id: module.id.getValue(),
        title: module.title,
        imageUrl: module.imageUrl || null,
        description: module.description,
        thematics: module.thematics,
        difficultyLevel: module.difficultyLevel || null,
        estimatedDuration: module.estimatedDuration,
        status: module.status,
      },
    });

    return this.toDomain(created);
  }

  async findAll(): Promise<Module[]> {
    const modules = await this.prisma.module.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return modules.map(m => this.toDomain(m));
  }

  private toDomain(prismaModule: PrismaModule): Module {
    return new Module({
      id: EntityId.from(prismaModule.id),
      title: prismaModule.title,
      imageUrl: prismaModule.imageUrl || null,
      description: prismaModule.description,
      thematics: prismaModule.thematics as Thematic[],
      difficultyLevel: (prismaModule.difficultyLevel as DifficultyLevel) || undefined,
      estimatedDuration: prismaModule.estimatedDuration || 0,
      status: prismaModule.status as ModuleStatus,
      createdAt: prismaModule.createdAt,
      updatedAt: prismaModule.updatedAt,
    });
  }
}
