import type {
  GetQuizProgressQuery,
  GetQuizProgressUseCase,
} from '@/domain/formations/ports/in/GetQuizProgressUseCase';
import type { IQuizProgressRepository } from '@/domain/formations/ports/out/IQuizProgressRepository';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import type { QuizProgressDTO } from '@/domain/formations/value-objects/QuizProgressDTO';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

export class GetQuizProgressUseCaseImpl implements GetQuizProgressUseCase {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizProgressRepository: IQuizProgressRepository
  ) {}

  async execute(query: GetQuizProgressQuery): Promise<QuizProgressDTO> {
    const quiz = await this.quizRepository.findById(query.quizId);
    if (!quiz) {
      throw new NotFoundError(`quiz with id ${query.quizId} not found`);
    }

    const [totalAttempts, hasPassed, bestAttempt, latestAttempt] = await Promise.all([
      this.quizProgressRepository.countAttemptsByUser(query.quizId, query.userId),
      this.quizProgressRepository.hasPassedQuiz(query.quizId, query.userId),
      this.quizProgressRepository.findBestAttemptByUser(query.quizId, query.userId),
      this.quizProgressRepository.findLatestAttemptByUser(query.quizId, query.userId),
    ]);

    return {
      quizId: query.quizId,
      userId: query.userId,
      totalAttempts,
      maxAttempts: quiz.nombreTentatives,
      remainingAttempts: Math.max(quiz.nombreTentatives - totalAttempts, 0),
      hasPassed,
      bestScorePercent: bestAttempt?.scorePercent ?? null,
      lastScorePercent: latestAttempt?.scorePercent ?? null,
      lastAttemptAt: latestAttempt?.createdAt ?? null,
    };
  }
}
