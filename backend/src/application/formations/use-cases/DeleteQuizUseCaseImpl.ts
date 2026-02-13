import type { DeleteQuizUseCase } from '@/domain/formations/ports/in/DeleteQuizUseCase';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

export class DeleteQuizUseCaseImpl implements DeleteQuizUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(id: string): Promise<void> {
    const quiz = await this.quizRepository.findById(id);
    if (!quiz) {
      throw new NotFoundError(`Quiz with id ${id} not found`);
    }

    await this.quizRepository.delete(id);
  }
}
