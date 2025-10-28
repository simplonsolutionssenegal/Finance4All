//application/formations/use-cases/CreateModule.usecase.ts
import type { CreateModuleUseCase } from '@/domain/formations/ports/in/CreateModuleUseCase';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type {
  CreateModuleDTO,
  ModuleResponseDTO,
} from '@/domain/formations/value-objects/ModuleFormationDTO';
import { Module, ModuleStatus } from '@/domain/formations/entities/ModuleFormation';
import { EntityId } from '@/domain/shared/EntityId';

export class CreateModuleUseCaseImpl implements CreateModuleUseCase {
  constructor(private readonly moduleRepository: ModuleRepository) {}
  async execute(input: CreateModuleDTO): Promise<ModuleResponseDTO> {
    // Créer l'entité Module
    const module = new Module({
      id: EntityId.generate(),
      title: input.title,
      description: input.description,
      imageUrl: input.imageUrl,
      thematics: input.thematics,
      difficultyLevel: input.difficultyLevel,
      estimatedDuration: input.estimatedDuration,
      status: ModuleStatus.DRAFT,
    });

    const savedModule = await this.moduleRepository.save(module);

    return savedModule.toDTO();
  }
}
