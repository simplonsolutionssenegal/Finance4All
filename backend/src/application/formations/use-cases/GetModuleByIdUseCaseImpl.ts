// application/formations/use-cases/GetModuleByIdUseCaseImpl.ts

import type {
  GetModuleByIdUseCaseQuery,
  GetModuleByIdUseCase,
} from '@/domain/formations/ports/in/GetModuleByIdUseCase';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import type { QuizDTO } from '@/domain/formations/value-objects/QuizDTO';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';

export class GetModuleByIdUseCaseImpl implements GetModuleByIdUseCase {
  constructor(private readonly moduleRepository: ModuleRepository) {}

  async execute(query: GetModuleByIdUseCaseQuery): Promise<ModuleResponseDTO> {
    const module = await this.moduleRepository.findById(query.id);

    if (!module) {
      throw new NotFoundError(`module with id ${query.id} not found`);
    }

    const moduleDTO = module.toDTO();

    const quizzesGlobal: QuizDTO[] = [...moduleDTO.quizzes];

    for (const lesson of moduleDTO.lessons) {
      quizzesGlobal.push(...lesson.quizzes);

      for (const chapter of lesson.chapters) {
        if (chapter.quizzes) {
          quizzesGlobal.push(...chapter.quizzes);
        }
      }
    }

    return {
      ...moduleDTO,
      quizzesGlobal,
    };
  }
}
