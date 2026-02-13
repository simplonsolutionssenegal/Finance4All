import { randomUUID } from 'crypto';
import type { Quiz } from '@/domain/formations/entities/Quiz';
import { QuizAttempt } from '@/domain/formations/entities/QuizAttempt';
import { TypeQuestion, type Question } from '@/domain/formations/entities/Question';
import type {
  SubmitQuizAttemptCommand,
  SubmitQuizAttemptResult,
  SubmitQuizAttemptUseCase,
} from '@/domain/formations/ports/in/SubmitQuizAttemptUseCase';
import type { IQuizProgressRepository } from '@/domain/formations/ports/out/IQuizProgressRepository';
import type { QuizRepository } from '@/domain/formations/ports/out/QuizRepository';
import { NotFoundError } from '@/domain/shared/errors/NotFoundError';

export class SubmitQuizAttemptUseCaseImpl implements SubmitQuizAttemptUseCase {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly quizProgressRepository: IQuizProgressRepository
  ) {}

  async execute(command: SubmitQuizAttemptCommand): Promise<SubmitQuizAttemptResult> {
    const quiz = await this.quizRepository.findById(command.quizId);
    if (!quiz) {
      throw new NotFoundError(`quiz with id ${command.quizId} not found`);
    }

    const attemptsCount = await this.quizProgressRepository.countAttemptsByUser(
      command.quizId,
      command.userId
    );

    if (attemptsCount >= quiz.nombreTentatives) {
      throw new Error('Nombre maximal de tentatives atteint pour ce quiz');
    }

    const answerMap = new Map<number, number[]>();
    const normalizedAnswers: { questionIndex: number; selectedOptionIndexes: number[] }[] = [];
    for (const answer of command.answers) {
      const normalizedIndexes = [...new Set(answer.selectedOptionIndexes)].sort((a, b) => a - b);
      answerMap.set(answer.questionIndex, normalizedIndexes);
      normalizedAnswers.push({
        questionIndex: answer.questionIndex,
        selectedOptionIndexes: normalizedIndexes,
      });
    }

    const earnedPoints = this.computeEarnedPoints(quiz, answerMap);
    const totalPoints = quiz.totalPoints;
    const scorePercent =
      totalPoints === 0 ? 0 : Number(((earnedPoints / totalPoints) * 100).toFixed(2));
    const isPassed = scorePercent >= quiz.scoreMinimum;

    const attempt = new QuizAttempt({
      id: randomUUID(),
      quizId: command.quizId,
      userId: command.userId,
      attemptNumber: attemptsCount + 1,
      earnedPoints,
      totalPoints,
      scorePercent,
      isPassed,
      answers: normalizedAnswers,
    });

    const savedAttempt = await this.quizProgressRepository.save(attempt);
    const hasPassedQuiz =
      savedAttempt.isPassed ||
      (await this.quizProgressRepository.hasPassedQuiz(command.quizId, command.userId));

    return {
      ...savedAttempt.toDTO(),
      maxAttempts: quiz.nombreTentatives,
      remainingAttempts: Math.max(quiz.nombreTentatives - savedAttempt.attemptNumber, 0),
      hasPassedQuiz,
    };
  }

  private computeEarnedPoints(quiz: Quiz, answerMap: Map<number, number[]>): number {
    let earnedPoints = 0;

    quiz.questions.forEach((question, questionIndex) => {
      const selectedIndexes = answerMap.get(questionIndex) ?? [];
      const questionDto = question.toDTO();
      const correctIndexes = this.getCorrectOptionIndexes(questionDto.options);

      if (this.isCorrectAnswer(question, selectedIndexes, correctIndexes)) {
        earnedPoints += question.points;
      }
    });

    return earnedPoints;
  }

  private getCorrectOptionIndexes(options: { isCorrect: boolean }[]): number[] {
    return options
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => option.isCorrect)
      .map(({ index }) => index)
      .sort((a, b) => a - b);
  }

  private isCorrectAnswer(
    question: Question,
    selectedIndexes: number[],
    correctIndexes: number[]
  ): boolean {
    if (question._type === TypeQuestion.CHOIX_UNIQUE) {
      return (
        selectedIndexes.length === 1 &&
        correctIndexes.length === 1 &&
        selectedIndexes[0] === correctIndexes[0]
      );
    }

    if (question._type === TypeQuestion.CHOIX_MULTIPLE) {
      if (selectedIndexes.length !== correctIndexes.length) {
        return false;
      }

      return selectedIndexes.every((selectedIndex, idx) => selectedIndex === correctIndexes[idx]);
    }

    return false;
  }
}
