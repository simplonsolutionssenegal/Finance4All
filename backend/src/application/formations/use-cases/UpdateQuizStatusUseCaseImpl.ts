import { NotFoundError } from '@/domain/shared/errors/NotFoundError';
import type { QuizDTO } from '@/domain/formations/value-objects/QuizDTO';
import type {
  UpdateQuizStatusCommand,
  UpdateQuizStatusUseCase,
} from '@/domain/formations/ports/in/UpdateStatusQuizUseCase';
import { QuizStatus } from '@prisma/client';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';

export class UpdateQuizStatusUseCaseImpl implements UpdateQuizStatusUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(command: UpdateQuizStatusCommand): Promise<QuizDTO> {
    const existingQuiz = await this.quizRepository.findById(command.id);

    if (!existingQuiz) {
      throw new NotFoundError(`Quiz with id ${command.id} not found`);
    }

    if (command.status === QuizStatus.ARCHIVED) {
      existingQuiz.archive();
    }

    if (command.status === QuizStatus.PUBLISHED) {
      existingQuiz.publish();
    }
    if (command.status === QuizStatus.DRAFT) {
      existingQuiz.draft();
    }

    const savedQuiz = await this.quizRepository.update(existingQuiz);

    return savedQuiz.toDTO();
  }
}
