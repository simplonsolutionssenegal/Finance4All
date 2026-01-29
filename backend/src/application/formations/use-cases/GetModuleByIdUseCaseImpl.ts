import type {
  GetModuleByIdUseCaseQuery,
  GetModuleByIdUseCase,
} from '@/domain/formations/ports/in/GetModuleByIdUseCase';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';

export class GetModuleByIdUseCaseImpl implements GetModuleByIdUseCase {
  constructor(private readonly moduleRepository: ModuleRepository) {}

  async execute(query: GetModuleByIdUseCaseQuery): Promise<ModuleResponseDTO> {
    const module = await this.moduleRepository.findById(query.id);

    if (!module) {
      throw new NotFoundError(`module with id ${query.id} not found`);
    }

    return module.toDTO();
  }
}
