import { render, screen } from '@testing-library/react';

import LessonPageClient from '@/components/learning/LessonPageClient';
import { LessonStatus, QuizStatus } from '@/types/learning/lesson';

jest.mock('@/hooks/module/useGetModuleById', () => ({
  useGetModuleById: jest.fn(),
}));

jest.mock('@/hooks/lesson/useGetLessonById', () => ({
  useGetLessonById: jest.fn(),
}));

const lessonDetailMock = jest.fn(() => <div data-testid='lesson-detail' />);
jest.mock('@/components/learning/LessonDetailContent', () => ({
  __esModule: true,
  default: (props: unknown) => lessonDetailMock(props),
}));

const mockUseGetModuleById = jest.requireMock('@/hooks/module/useGetModuleById')
  .useGetModuleById as jest.Mock;
const mockUseGetLessonById = jest.requireMock('@/hooks/lesson/useGetLessonById')
  .useGetLessonById as jest.Mock;

describe('LessonPageClient', () => {
  beforeEach(() => {
    lessonDetailMock.mockClear();
  });

  it('shows loading state when module is loading', () => {
    mockUseGetModuleById.mockReturnValue({
      module: undefined,
      isLoading: true,
      isError: false,
    });
    mockUseGetLessonById.mockReturnValue({
      lesson: undefined,
      isLoading: false,
      isError: false,
    });

    render(<LessonPageClient moduleId='module-1' order={1} />);

    expect(screen.getByText(/chargement de la leçon/i)).toBeInTheDocument();
  });

  it('shows loading state when lesson is loading for current lesson', () => {
    mockUseGetModuleById.mockReturnValue({
      module: {
        id: 'module-1',
        lessons: [
          {
            id: 'lesson-1',
            title: 'L1',
            description: 'Desc',
            duration: 20,
            order: 1,
            status: LessonStatus.PUBLISHED,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetLessonById.mockReturnValue({
      lesson: undefined,
      isLoading: true,
      isError: false,
    });

    render(<LessonPageClient moduleId='module-1' order={1} />);

    expect(screen.getByText(/chargement de la leçon/i)).toBeInTheDocument();
  });

  it('shows not found when lesson order is missing', () => {
    mockUseGetModuleById.mockReturnValue({
      module: {
        id: 'module-1',
        lessons: [
          {
            id: 'lesson-2',
            title: 'L2',
            description: 'Desc',
            duration: 20,
            order: 2,
            status: LessonStatus.PUBLISHED,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetLessonById.mockReturnValue({
      lesson: undefined,
      isLoading: false,
      isError: false,
    });

    render(<LessonPageClient moduleId='module-1' order={1} />);

    expect(screen.getByText(/leçon introuvable/i)).toBeInTheDocument();
  });

  it('shows not found when lesson fetch fails', () => {
    mockUseGetModuleById.mockReturnValue({
      module: {
        id: 'module-1',
        lessons: [
          {
            id: 'lesson-1',
            title: 'L1',
            description: 'Desc',
            duration: 20,
            order: 1,
            status: LessonStatus.PUBLISHED,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetLessonById.mockReturnValue({
      lesson: undefined,
      isLoading: false,
      isError: true,
    });

    render(<LessonPageClient moduleId='module-1' order={1} />);

    expect(screen.getByText(/leçon introuvable/i)).toBeInTheDocument();
  });

  it('renders lesson detail content with fetched data', () => {
    mockUseGetModuleById.mockReturnValue({
      module: {
        id: 'module-1',
        lessons: [
          {
            id: 'lesson-2',
            title: 'L2',
            description: 'Desc',
            duration: 20,
            order: 2,
            status: LessonStatus.PUBLISHED,
          },
          {
            id: 'lesson-1',
            title: 'L1',
            description: 'Desc',
            duration: 20,
            order: 1,
            status: LessonStatus.PUBLISHED,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetLessonById.mockReturnValue({
      lesson: {
        id: 'lesson-2',
        title: 'L2',
        description: 'Desc',
        duration: 20,
        order: 2,
        status: LessonStatus.PUBLISHED,
        chapters: [
          {
            id: 'chapter-1',
            title: 'Chapitre 1',
            description: 'Desc',
            order: 1,
            mediaId: 'media-1',
            quizzes: [
              {
                id: 'chapter-quiz-1',
                title: 'Quiz chapitre',
                description: 'Desc',
                status: QuizStatus.PUBLISHED,
                scoreMinimum: 60,
                nombreTentatives: 3,
                questions: [],
              },
            ],
          },
          {
            id: 'chapter-2',
            title: 'Chapitre 2',
            description: 'Desc',
            order: 2,
            quizzes: [
              {
                id: 'chapter-quiz-2',
                title: 'Quiz chapitre 2',
                description: 'Desc',
                status: 'DRAFT',
                scoreMinimum: 60,
                nombreTentatives: 3,
                questions: [],
              },
            ],
          },
        ],
        quizzes: [
          {
            id: 'lesson-quiz-1',
            title: 'Quiz leçon',
            description: 'Desc',
            status: QuizStatus.PUBLISHED,
            scoreMinimum: 70,
            nombreTentatives: 2,
            questions: [],
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    render(<LessonPageClient moduleId='module-1' order={2} />);

    expect(screen.getByTestId('lesson-detail')).toBeInTheDocument();
    const props = lessonDetailMock.mock.calls[0][0] as {
      moduleId: string;
      lessonId: string;
      chapters: unknown[];
      quizzes: unknown[];
    };
    expect(props.moduleId).toBe('module-1');
    expect(props.lessonId).toBe('lesson-2');
    expect(props.chapters).toHaveLength(2);
    expect(props.quizzes).toHaveLength(2);
  });

  it('uses lesson summary when details are missing', () => {
    mockUseGetModuleById.mockReturnValue({
      module: {
        id: undefined,
        lessons: [
          {
            id: 'lesson-1',
            title: 'Résumé',
            description: 'Résumé desc',
            duration: 20,
            order: 1,
            status: LessonStatus.PUBLISHED,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetLessonById.mockReturnValue({
      lesson: undefined,
      isLoading: false,
      isError: false,
    });

    render(<LessonPageClient moduleId='module-1' order={1} />);

    const props = lessonDetailMock.mock.calls[0][0] as {
      lessonTitle: string;
      lessonDescription: string;
      chapters: unknown[];
      quizzes: unknown[];
    };

    expect(props.lessonTitle).toBe('Résumé');
    expect(props.lessonDescription).toBe('Résumé desc');
    expect(props.chapters).toHaveLength(0);
    expect(props.quizzes).toHaveLength(0);
  });

  it('falls back to moduleId when module id is missing', () => {
    mockUseGetModuleById.mockReturnValue({
      module: {
        id: undefined,
        lessons: [
          {
            id: 'lesson-1',
            title: 'L1',
            description: 'Desc',
            duration: 20,
            order: 1,
            status: LessonStatus.PUBLISHED,
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetLessonById.mockReturnValue({
      lesson: {
        id: 'lesson-1',
        title: 'L1',
        description: 'Desc',
        duration: 20,
        order: 1,
        status: LessonStatus.PUBLISHED,
        chapters: undefined,
        quizzes: [
          {
            id: 'lesson-quiz-1',
            title: 'Quiz leçon',
            description: 'Desc',
            status: QuizStatus.PUBLISHED,
            scoreMinimum: 70,
            nombreTentatives: 2,
            questions: [],
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    render(<LessonPageClient moduleId='module-1' order={1} />);

    const props = lessonDetailMock.mock.calls[0][0] as {
      quizzes: { moduleId: string }[];
      chapters: unknown[];
    };

    expect(props.quizzes[0].moduleId).toBe('module-1');
    expect(props.chapters).toHaveLength(0);
  });
});
