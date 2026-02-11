import { Quiz } from '@/domain/formations/entities/Quiz';
import type { AddQuizUseCase, AddQuizCommand } from '@/domain/formations/ports/in/AddQuizUseCase';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { ModuleResponseDTO } from '@/domain/formations/value-objects/ModuleFormationDTO';
import { EntityId } from '@/domain/shared/EntityId';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

import {
  TypeQuestion,
  QuestionChoixUnique,
  QuestionChoixMultiple,
} from '@/domain/formations/entities/Question';
import type { QuestionDTO } from '@/domain/formations/value-objects/QuestionDTO';

export class AddQuizUseCaseImpl implements AddQuizUseCase {
  constructor(private readonly moduleRepository: ModuleRepository) {}

  private mapQuestion(dto: QuestionDTO) {
    if (dto.type === TypeQuestion.CHOIX_UNIQUE) {
      return new QuestionChoixUnique(dto.question, dto.points, dto.options, dto.explication);
    }
    if (dto.type === TypeQuestion.CHOIX_MULTIPLE) {
      return new QuestionChoixMultiple(dto.question, dto.points, dto.options, dto.explication);
    }
    throw new Error(`TypeQuestion inconnu: ${String((dto as any).type)}`);
  }

  async execute(command: AddQuizCommand): Promise<ModuleResponseDTO> {
    const existingModule = await this.moduleRepository.findById(command.moduleId);

    if (!existingModule) {
      throw new NotFoundError(`Module with id ${command.moduleId} not found`);
    }

    const questions = (command.questions ?? []).map(q => this.mapQuestion(q));

    const quiz = new Quiz({
      id: EntityId.generate(),
      title: command.title,
      description: command.description,
      status: command.status,
      scoreMinimum: command.scoreMinimum,
      duree: command.duree,
      nombreTentatives: command.nombreTentatives,
      questions,
    });

    existingModule.addQuiz(quiz);
    const savedModule = await this.moduleRepository.update(existingModule);

    return savedModule.toDTO();
  }
}
