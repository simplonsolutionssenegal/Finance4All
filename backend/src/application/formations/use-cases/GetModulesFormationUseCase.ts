//application/formations/use-cases/GetModules.usecase.ts

import type { Module } from '@/domain/formations/entities/ModuleFormation';
import type { GetModulesUseCase } from '@/domain/formations/ports/in/GetModulesUseCase';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';

export class GetModulesUseCaseImpl implements GetModulesUseCase {
  constructor(private readonly moduleRepository: ModuleRepository) {}
  async execute(): Promise<ModuleResponseDTO[]> {
    // Récupérer tous les modules
    const modules = await this.moduleRepository.findAll();
    // Convertir en DTO
    return modules.map((module: Module) => module.toDTO());
  }
}
