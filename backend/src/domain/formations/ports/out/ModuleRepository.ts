//domain/formations/ports/out/ModuleRepository.ts

import type { Module } from '@/domain/formations/entities/ModuleFormation';

export interface ModuleRepository {
  /**
   * Sauvegarde un nouveau module
   */
  save(module: Module): Promise<Module>;

  /**
   * Récupère tous les modules
   */
  findAll(): Promise<Module[]>;
}
