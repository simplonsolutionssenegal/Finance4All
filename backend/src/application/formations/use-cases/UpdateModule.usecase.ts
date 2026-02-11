// application/formations/use-cases/UpdateModule.usecase.ts
import type {
  UpdateModuleUseCase,
  UpdateModuleUseCommand,
} from '@/domain/formations/ports/in/UpdateModuleUseCase';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import {
  DuplicateThematicException,
  DuplicateTitleException,
} from '@/domain/shared/exceptions/FormationDomainException';

export class UpdateModuleFormationUseCaseImpl implements UpdateModuleUseCase {
  constructor(private readonly moduleRepository: ModuleRepository) {}

  async execute(cmd: UpdateModuleUseCommand): Promise<ModuleResponseDTO> {
    const module = await this.moduleRepository.findById(cmd.id);
    if (!module) throw new NotFoundError(`module with id ${cmd.id} not found`);

    // title (si fourni)
    if (cmd.title !== undefined) {
      const existing = await this.moduleRepository.findByTitleExceptId(cmd.title, cmd.id);
      if (existing) throw new DuplicateTitleException(cmd.title);
      module.updateTitle(cmd.title);
    }

    // thematics (si fourni)
    if (cmd.thematics !== undefined) {
      const normalized = cmd.thematics.toLowerCase().trim();
      const existing = await this.moduleRepository.findByThematicExceptId(normalized, cmd.id);
      if (existing) throw new DuplicateThematicException(cmd.thematics);
      module.updateThematics(normalized);
    }

    if (cmd.description !== undefined) module.updateDescription(cmd.description);
    if (cmd.imageMediaId !== undefined) module.updateImageMediaId(cmd.imageMediaId);
    if (cmd.difficultyLevel !== undefined) module.updateDifficultyLevel(cmd.difficultyLevel);
    if (cmd.estimatedDuration !== undefined) module.updateEstimatedDuration(cmd.estimatedDuration);
    if (cmd.status !== undefined) module.updateStatus(cmd.status);

    const updated = await this.moduleRepository.update(module);
    return updated.toDTO();
  }
}
