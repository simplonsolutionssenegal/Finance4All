//domain/formations/ports/out/ModuleRepository.ts

import type { Module } from '@/domain/formations/entities/ModuleFormation';
import type { PaginatedResult, PaginationParams } from '@/domain/shared/Pagination';

export interface ModuleRepository {
  /**
   * Sauvegarde un nouveau module
   */
  save(module: Module): Promise<Module>;
  /**
   * Met à jour un module existant
   */

  findByTitle(title: string): Promise<Module | null>;

  /**
   * Récupère tous les modules
   */

  findAll(params: PaginationParams): Promise<PaginatedResult<Module>>;
}
