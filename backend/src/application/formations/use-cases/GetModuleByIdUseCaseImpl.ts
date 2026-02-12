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

    // ✅ Utiliser la méthode getAllQuizzes() de l'entité Module
    // au lieu de parcourir manuellement les DTOs
    const quizzesGlobal = module.getAllQuizzes().map(quiz => quiz.toDTO());

    const moduleDTO = module.toDTO();

    return {
      ...moduleDTO,
      quizzesGlobal,
    };
  }
}
