import type {
  GetQuizByIdUseCase,
  GetQuizByIdUseCaseQuery,
} from '@/domain/formations/ports/in/GetQuizByIdUseCase';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import type { QuizDTO } from '@/domain/formations/value-objects/QuizDTO';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

export class GetQuizByIdUseCaseImpl implements GetQuizByIdUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}
  async execute(query: GetQuizByIdUseCaseQuery): Promise<QuizDTO> {
    const quiz = await this.quizRepository.findById(query.id);

    if (!quiz) {
      throw new NotFoundError(`quiz with id ${query.id} not found`);
    }
    return quiz.toDTO();
  }
}
