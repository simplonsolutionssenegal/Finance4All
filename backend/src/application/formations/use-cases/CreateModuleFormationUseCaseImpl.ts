//application/formations/use-cases/CreateModule.usecase.ts
import type {
  CreateModuleUseCase,
  CreateModuleUseCommand,
} from '@/domain/formations/ports/in/CreateModuleUseCase';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import { Module, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';

import { EntityId } from '@/domain/shared/EntityId';
import {
  DuplicateThematicException,
  DuplicateTitleException,
} from '@/domain/shared/exceptions/FormationDomainException';

export class CreateModuleFormationUseCaseImpl implements CreateModuleUseCase {
  constructor(private readonly moduleRepository: ModuleRepository) {}
  async execute(input: CreateModuleUseCommand): Promise<ModuleResponseDTO> {
    const existingModule = await this.moduleRepository.findByTitle(input.title);

    // Normaliser la thématique en minuscules et trim les espaces
    const normalizedThematic = input.thematics.toLowerCase().trim();

    const existingThematic = await this.moduleRepository.findByThematic(normalizedThematic);
    if (existingThematic) {
      throw new DuplicateThematicException(input.thematics);
    }

    if (existingModule) {
      throw new DuplicateTitleException(input.title);
    }

    // Créer l'entité Module avec la thématique normalisée
    const module = new Module({
      id: EntityId.generate(),
      title: input.title,
      description: input.description,
      imageMediaId: input.imageMediaId,
      thematics: normalizedThematic,
      difficultyLevel: input.difficultyLevel,
      estimatedDuration: input.estimatedDuration,
      status: ModuleStatus.DRAFT,
      lessons: [],
      quizzes: [],
    });

    const savedModule = await this.moduleRepository.save(module);

    return savedModule.toDTO();
  }
}
