import { render, screen } from '@testing-library/react';

import QuizList from '@/components/learning/QuizList';
import { QuizStatus, TypeQuestion, type Quiz } from '@/types/learning/lesson';
import type { QuizProgressDTO } from '@/types/learning/quiz-progress';

const createQuiz = (overrides: Partial<Quiz>): Quiz => ({
  id: 'quiz-1',
  moduleId: 'module-1',
  title: 'Quiz 1',
  description: 'Description',
  status: QuizStatus.PUBLISHED,
  scoreMinimum: 70,
  duree: null,
  nombreTentatives: 3,
  questions: [
    {
      question: 'Q1',
      type: TypeQuestion.CHOIX_UNIQUE,
      points: 1,
      options: [{ text: 'A', isCorrect: true }],
    },
  ],
  ...overrides,
});

describe('QuizList', () => {
  it('shows empty state when no quizzes', () => {
    render(
      <QuizList
        moduleId='module-1'
        quizzes={[]}
        quizAvailability={new Map()}
        quizProgressMap={new Map()}
      />
    );

    expect(screen.getByText(/aucun quiz publié/i)).toBeInTheDocument();
  });

  it('shows question count with pluralization', () => {
    const quizzes = [
      createQuiz({
        id: 'quiz-1',
        questions: [
          {
            question: 'Q1',
            type: TypeQuestion.CHOIX_UNIQUE,
            points: 1,
            options: [{ text: 'A', isCorrect: true }],
          },
          {
            question: 'Q2',
            type: TypeQuestion.CHOIX_UNIQUE,
            points: 1,
            options: [{ text: 'B', isCorrect: true }],
          },
        ],
      }),
    ];

    render(
      <QuizList
        moduleId='module-1'
        quizzes={quizzes}
        quizAvailability={new Map([['quiz-1', true]])}
        quizProgressMap={new Map()}
      />
    );

    expect(screen.getByText('2 questions')).toBeInTheDocument();
  });

  it('shows "Faire" when no attempts and quiz is available', () => {
    const quizzes = [createQuiz({ id: 'quiz-1', title: 'Quiz A' })];
    const availability = new Map<string, boolean>([['quiz-1', true]]);
    const progress = new Map<string, QuizProgressDTO>([
      [
        'quiz-1',
        {
          quizId: 'quiz-1',
          userId: 'user-1',
          totalAttempts: 0,
          maxAttempts: 3,
          remainingAttempts: 3,
          hasPassed: false,
          bestScorePercent: null,
          lastScorePercent: null,
          lastAttemptAt: null,
        },
      ],
    ]);

    render(
      <QuizList
        moduleId='module-1'
        quizzes={quizzes}
        quizAvailability={availability}
        quizProgressMap={progress}
      />
    );

    const link = screen.getByRole('link', { name: /faire/i });
    expect(link).toHaveAttribute('href', '/learning/module-1/quiz/quiz-1');
  });

  it('shows score and disables button when attempts exhausted', () => {
    const quizzes = [createQuiz({ id: 'quiz-2', title: 'Quiz B' })];
    const availability = new Map<string, boolean>([['quiz-2', true]]);
    const progress = new Map<string, QuizProgressDTO>([
      [
        'quiz-2',
        {
          quizId: 'quiz-2',
          userId: 'user-1',
          totalAttempts: 2,
          maxAttempts: 2,
          remainingAttempts: 0,
          hasPassed: false,
          bestScorePercent: 85,
          lastScorePercent: 85,
          lastAttemptAt: '2025-01-01T00:00:00.000Z',
        },
      ],
    ]);

    render(
      <QuizList
        moduleId='module-1'
        quizzes={quizzes}
        quizAvailability={availability}
        quizProgressMap={progress}
      />
    );

    expect(screen.getByText('Score: 85%')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /refaire/i });
    expect(button).toBeDisabled();
  });

  it('shows locked state when quiz is unavailable', () => {
    const quizzes = [createQuiz({ id: 'quiz-3', title: 'Quiz C' })];
    const availability = new Map<string, boolean>([['quiz-3', false]]);
    const progress = new Map<string, QuizProgressDTO>();

    render(
      <QuizList
        moduleId='module-1'
        quizzes={quizzes}
        quizAvailability={availability}
        quizProgressMap={progress}
      />
    );

    expect(screen.getByRole('button', { name: /verrouillé/i })).toBeDisabled();
  });
});
