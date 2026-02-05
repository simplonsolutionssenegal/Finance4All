//domain/formations/ports/out/ModuleRepository.ts

import type { Module } from '@/domain/formations/entities/ModuleFormation';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';

export interface ModuleRepository {
  save(module: Module): Promise<Module>;

  findByTitle(title: string): Promise<Module | null>;

  findByThematic(thematic: string): Promise<Module | null>;

  findById(id: string): Promise<Module | null>;
  update(module: Module): Promise<Module>;

  findAll(params: PaginationParams): Promise<PaginatedResult<Module>>;
  findByTitleExceptId(title: string, excludeId: string): Promise<Module | null>;
  findByThematicExceptId(thematic: string, excludeId: string): Promise<Module | null>;
  findById(id: string): Promise<Module | null>;
  update(module: Module): Promise<Module>;
  findAll(params: PaginationParams): Promise<PaginatedResult<Module>>;
}
