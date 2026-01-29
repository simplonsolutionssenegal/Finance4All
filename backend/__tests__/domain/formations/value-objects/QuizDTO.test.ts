import type { QuizDTO } from '@/domain/formations/value-objects/QuizDTO';
import { QuizStatus } from '@/domain/formations/entities/Quiz';
import { TypeQuestion } from '@/domain/formations/entities/Question';

describe('QuizDTO', () => {
  it('should accept a valid QuizDTO with duree provided', () => {
    const dto: QuizDTO = {
      id: 'quiz-1',
      title: 'Quiz 1',
      description: 'Description',
      status: QuizStatus.DRAFT,
      scoreMinimum: 70,
      duree: 1800,
      nombreTentatives: 2,
      questions: [
        {
          type: TypeQuestion.CHOIX_UNIQUE,
          question: 'Q1',
          points: 10,
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
          explication: 'Parce que A',
        },
      ],
      totalPoints: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(dto.duree).toBe(1800);
    expect(dto.questions).toHaveLength(1);
    expect(dto.createdAt).toBeInstanceOf(Date);
    expect(dto.updatedAt).toBeInstanceOf(Date);
  });

  it('should allow duree to be undefined', () => {
    const dto: QuizDTO = {
      id: 'quiz-2',
      title: 'Quiz 2',
      description: 'Description',
      status: QuizStatus.PUBLISHED,
      scoreMinimum: 60,
      // duree omitted
      nombreTentatives: 3,
      questions: [],
      totalPoints: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(dto.duree).toBeUndefined();
    expect(dto.totalPoints).toBe(0);
  });
});
