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

jest.mock('@/hooks/module/useGetModuleById', () => ({
  useGetModuleById: jest.fn(),
}));

jest.mock('@/hooks/quiz/useGetQuizById', () => ({
  useGetQuizById: jest.fn(),
}));

jest.mock('@/hooks/lesson/useGetLessonById', () => ({
  useGetLessonById: jest.fn(),
}));

const quizRunnerMock = jest.fn(() => <div data-testid='quiz-runner' />);
jest.mock('@/components/learning/QuizRunner', () => ({
  __esModule: true,
  default: (props: unknown) => quizRunnerMock(props),
}));

const mockUseGetModuleById = jest.requireMock('@/hooks/module/useGetModuleById')
  .useGetModuleById as jest.Mock;
const mockUseGetQuizById = jest.requireMock('@/hooks/quiz/useGetQuizById')
  .useGetQuizById as jest.Mock;
const mockUseGetLessonById = jest.requireMock('@/hooks/lesson/useGetLessonById')
  .useGetLessonById as jest.Mock;

describe('QuizPageClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche le chargement', () => {
    mockUseGetModuleById.mockReturnValue({ module: undefined });
    mockUseGetQuizById.mockReturnValue({ quiz: undefined, isLoading: true, isError: false });
    mockUseGetLessonById.mockReturnValue({ lesson: undefined });

    render(<QuizPageClient moduleId='module-1' quizId='quiz-1' />);

    expect(screen.getByText(/Chargement du quiz/i)).toBeInTheDocument();
  });

  it('affiche un état d’erreur', () => {
    mockUseGetModuleById.mockReturnValue({ module: undefined });
    mockUseGetQuizById.mockReturnValue({ quiz: undefined, isLoading: false, isError: true });
    mockUseGetLessonById.mockReturnValue({ lesson: undefined });

    render(<QuizPageClient moduleId='module-1' quizId='quiz-1' />);

    expect(screen.getByText(/Quiz introuvable/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Retour au module/i })).toHaveAttribute(
      'href',
      '/learning/module-1'
    );
  });

  it('calcule la redirection vers le chapitre suivant', () => {
    mockUseGetModuleById.mockReturnValue({
      module: {
        id: 'module-1',
        lessons: [
          {
            id: 'lesson-1',
            title: 'L1',
            description: 'Desc',
            order: 1,
            status: 'PUBLISHED',
          },
        ],
        quizzesGlobal: [
          {
            id: 'lesson-quiz-1',
            lessonId: 'lesson-1',
            title: 'Quiz leçon',
            description: 'Desc',
            status: QuizStatus.PUBLISHED,
            scoreMinimum: 60,
            nombreTentatives: 2,
            questions: [],
          },
        ],
      },
    });

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

    mockUseGetLessonById.mockReturnValue({
      lesson: {
        id: 'lesson-1',
        order: 1,
        chapters: [
          { id: 'chapter-1', title: 'C1', description: 'D', order: 1 },
          { id: 'chapter-2', title: 'C2', description: 'D', order: 2 },
        ],
      },
    });

    render(<QuizPageClient moduleId='module-1' quizId='chapter-quiz-1' />);

    const props = quizRunnerMock.mock.calls[0][0] as { afterSuccessRedirect: string };
    expect(props.afterSuccessRedirect).toBe('/learning/module-1/lesson/1?chapter=chapter-2');
  });

  it('redirige vers le quiz de leçon quand le chapitre est le dernier', () => {
    mockUseGetModuleById.mockReturnValue({
      module: {
        id: 'module-1',
        lessons: [
          {
            id: 'lesson-1',
            title: 'L1',
            description: 'Desc',
            order: 2,
            status: 'PUBLISHED',
          },
        ],
        quizzesGlobal: [
          {
            id: 'lesson-quiz-1',
            lessonId: 'lesson-1',
            title: 'Quiz leçon',
            description: 'Desc',
            status: QuizStatus.PUBLISHED,
            scoreMinimum: 60,
            nombreTentatives: 2,
            questions: [],
          },
        ],
      },
    });

    mockUseGetQuizById.mockReturnValue({
      quiz: {
        id: 'chapter-quiz-2',
        lessonId: 'lesson-1',
        chapterId: 'chapter-2',
        title: 'Quiz chapitre',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        questions: [],
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetLessonById.mockReturnValue({
      lesson: {
        id: 'lesson-1',
        order: 2,
        chapters: [{ id: 'chapter-2', title: 'C2', description: 'D', order: 1 }],
      },
    });

    render(<QuizPageClient moduleId='module-1' quizId='chapter-quiz-2' />);

    const props = quizRunnerMock.mock.calls[0][0] as { afterSuccessRedirect: string };
    expect(props.afterSuccessRedirect).toBe('/learning/module-1/quiz/lesson-quiz-1');
  });
});
