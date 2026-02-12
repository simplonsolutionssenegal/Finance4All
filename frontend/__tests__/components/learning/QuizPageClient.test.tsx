/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

import QuizPageClient from '@/components/learning/QuizPageClient';
import { QuizStatus } from '@/types/learning/lesson';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('@/hooks/quiz/useGetQuizById', () => ({
  useGetQuizById: jest.fn(),
}));

type QuizRunnerProps = { afterSuccessRedirect: string } & Record<string, unknown>;
const quizRunnerMock = jest.fn((props: QuizRunnerProps) => <div data-testid='quiz-runner' />);
jest.mock('@/components/learning/QuizRunner', () => ({
  __esModule: true,
  default: (props: QuizRunnerProps) => quizRunnerMock(props),
}));

const mockUseGetQuizById = jest.requireMock('@/hooks/quiz/useGetQuizById')
  .useGetQuizById as jest.Mock;

describe('QuizPageClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le chargement', () => {
    mockUseGetQuizById.mockReturnValue({ quiz: undefined, isLoading: true, isError: false });

    render(<QuizPageClient moduleId='module-1' quizId='quiz-1' />);

    expect(screen.getByText(/Chargement du quiz/i)).toBeInTheDocument();
  });

  it('affiche un Ã©tat dâ€™erreur', () => {
    mockUseGetQuizById.mockReturnValue({ quiz: undefined, isLoading: false, isError: true });

    render(<QuizPageClient moduleId='module-1' quizId='quiz-1' />);

    expect(screen.getByText(/Quiz introuvable/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Retour au module/i })).toHaveAttribute(
      'href',
      '/learning/module-1'
    );
  });

  it('redirige vers le module aprÃ¨s succÃ¨s', () => {
    mockUseGetQuizById.mockReturnValue({
      quiz: {
        id: 'chapter-quiz-1',
        lessonId: 'lesson-1',
        chapterId: 'chapter-1',
        title: 'Quiz chapitre',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        questions: [],
      },
      isLoading: false,
      isError: false,
    });

    render(<QuizPageClient moduleId='module-1' quizId='chapter-quiz-1' />);

    expect(quizRunnerMock).toHaveBeenCalled();
    const props = quizRunnerMock.mock.calls[0][0];
    expect(props.afterSuccessRedirect).toBe('/learning/module-1');
  });
});
