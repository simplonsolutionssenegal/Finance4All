import { render, screen } from '@testing-library/react';

import ModuleDetailClient from '@/components/learning/ModuleDetailClient';
import { LessonStatus, QuizStatus, type Quiz } from '@/types/learning/lesson';
import type { QuizProgressDTO } from '@/types/learning/quiz-progress';

jest.mock('next/image', () => ({
  __esModule: true,
  default: () => <img alt='' />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({ isLoaded: true })),
}));

jest.mock('@/hooks/module/useGetModuleById', () => ({
  useGetModuleById: jest.fn(),
}));

jest.mock('@/hooks/media/useGetMediaById', () => ({
  useGetMediaById: jest.fn(),
}));

jest.mock('@/hooks/quiz/useQuizProgressMap', () => ({
  useQuizProgressMap: jest.fn(),
}));

jest.mock('@/hooks/media/useMediaProgressMap', () => ({
  useMediaProgressMap: jest.fn(() => ({
    mediaProgressMap: new Map(),
    isLoading: false,
  })),
}));

const mockIsChapterViewed = jest.fn(() => false);
jest.mock('@/lib/learning/chapter-progress', () => ({
  isChapterViewed: (...args: unknown[]) => mockIsChapterViewed(...args),
  markChapterViewed: jest.fn(),
  getViewedChapterIds: jest.fn(() => new Set()),
}));

const moduleTabsMock = jest.fn((props: unknown) => <div data-testid='module-tabs' />);
jest.mock('@/components/learning/ModuleTabs', () => ({
  __esModule: true,
  default: (props: unknown) => moduleTabsMock(props),
}));

const mockUseGetModuleById = jest.requireMock('@/hooks/module/useGetModuleById')
  .useGetModuleById as jest.Mock;
const mockUseGetMediaById = jest.requireMock('@/hooks/media/useGetMediaById')
  .useGetMediaById as jest.Mock;
const mockUseQuizProgressMap = jest.requireMock('@/hooks/quiz/useQuizProgressMap')
  .useQuizProgressMap as jest.Mock;

describe('ModuleDetailClient', () => {
  beforeEach(() => {
    moduleTabsMock.mockClear();
  });

  it('renders loading state', () => {
    mockUseGetModuleById.mockReturnValue({
      module: undefined,
      isLoading: true,
      isError: false,
    });
    mockUseGetMediaById.mockReturnValue({ media: null });
    mockUseQuizProgressMap.mockReturnValue({ progressMap: new Map() });

    render(<ModuleDetailClient moduleId='module-1' />);

    expect(screen.getByText(/chargement du module/i)).toBeInTheDocument();
  });

  it('renders generic loading when Clerk is not loaded', () => {
    const { useUser } = jest.requireMock('@clerk/nextjs');
    (useUser as jest.Mock).mockReturnValueOnce({ isLoaded: false });
    mockUseGetModuleById.mockReturnValue({
      module: undefined,
      isLoading: true,
      isError: false,
    });

    render(<ModuleDetailClient moduleId='module-1' />);

    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it('renders error state when module is missing', () => {
    mockUseGetModuleById.mockReturnValue({
      module: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Not found'),
      refetch: jest.fn(),
    });
    mockUseGetMediaById.mockReturnValue({ media: null });
    mockUseQuizProgressMap.mockReturnValue({ progressMap: new Map() });

    render(<ModuleDetailClient moduleId='module-1' />);

    expect(screen.getByText(/not found|module introuvable/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /réessayer/i })).toBeInTheDocument();
  });

  it('renders stats from progress and passes maps to ModuleTabs', () => {
    const quizzesGlobal: Quiz[] = [
      {
        id: 'quiz-1',
        moduleId: 'module-1',
        lessonId: 'lesson-1',
        chapterId: 'chapter-1',
        title: 'Quiz 1',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: null,
        nombreTentatives: 3,
        questions: [],
      },
      {
        id: 'quiz-2',
        moduleId: 'module-1',
        lessonId: 'lesson-2',
        chapterId: 'chapter-2',
        title: 'Quiz 2',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: null,
        nombreTentatives: 3,
        questions: [],
      },
    ];

    mockUseGetModuleById.mockReturnValue({
      module: {
        id: 'module-1',
        title: 'Module',
        description: 'Desc',
        thematics: 'budget',
        imageMediaId: null,
        difficultyLevel: 'BEGINNER',
        estimatedDuration: 100,
        status: 'PUBLISHED',
        lessons: [
          {
            id: 'lesson-1',
            title: 'L1',
            description: 'Desc',
            duration: 20,
            order: 1,
            status: LessonStatus.PUBLISHED,
            chapters: [{ id: 'chapter-1', title: 'C1', description: 'D', order: 1 }],
          },
          {
            id: 'lesson-2',
            title: 'L2',
            description: 'Desc',
            duration: 20,
            order: 2,
            status: LessonStatus.PUBLISHED,
            chapters: [{ id: 'chapter-2', title: 'C2', description: 'D', order: 1 }],
          },
        ],
        quizzesGlobal,
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetMediaById.mockReturnValue({ media: null });

    const progressMap = new Map<string, QuizProgressDTO>([
      [
        'quiz-1',
        {
          quizId: 'quiz-1',
          userId: 'user-1',
          totalAttempts: 1,
          maxAttempts: 3,
          remainingAttempts: 2,
          hasPassed: true,
          bestScorePercent: 85,
          lastScorePercent: 85,
          lastAttemptAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      [
        'quiz-2',
        {
          quizId: 'quiz-2',
          userId: 'user-1',
          totalAttempts: 1,
          maxAttempts: 3,
          remainingAttempts: 2,
          hasPassed: false,
          bestScorePercent: 60,
          lastScorePercent: 60,
          lastAttemptAt: '2025-01-02T00:00:00.000Z',
        },
      ],
    ]);

    mockUseQuizProgressMap.mockReturnValue({ progressMap });

    render(<ModuleDetailClient moduleId='module-1' />);

    expect(screen.getByRole('link', { name: /retour aux modules/i })).toHaveAttribute(
      'href',
      '/learning'
    );
    expect(screen.getByText('Quiz réussis')).toBeInTheDocument();
    expect(screen.getAllByText('1/2')).toHaveLength(2);
    expect(screen.getByText('73%')).toBeInTheDocument();
    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);

    const props = moduleTabsMock.mock.calls[0][0] as {
      quizAvailability: Map<string, boolean>;
      quizProgressMap: Map<string, QuizProgressDTO>;
    };

    expect(props.quizAvailability.get('quiz-1')).toBe(true);
    expect(props.quizAvailability.get('quiz-2')).toBe(true);
    expect(props.quizProgressMap.get('quiz-1')?.bestScorePercent).toBe(85);
  });

  it('computes quiz availability for lesson and module quizzes', () => {
    // All chapters have been viewed → lesson quiz becomes available when chapters are complete
    mockIsChapterViewed.mockReturnValue(true);
    const quizzesGlobal: Quiz[] = [
      {
        id: 'chapter-quiz-1',
        moduleId: 'module-1',
        lessonId: 'lesson-1',
        chapterId: 'chapter-1',
        title: 'Quiz chapitre 1',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: null,
        nombreTentatives: 3,
        questions: [],
      },
      {
        id: 'lesson-quiz-1',
        moduleId: 'module-1',
        lessonId: 'lesson-1',
        chapterId: null,
        title: 'Quiz leçon',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: null,
        nombreTentatives: 3,
        questions: [],
      },
      {
        id: 'chapter-quiz-2',
        moduleId: 'module-1',
        lessonId: 'lesson-2',
        chapterId: 'chapter-3',
        title: 'Quiz chapitre 2',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: null,
        nombreTentatives: 3,
        questions: [],
      },
      {
        id: 'module-quiz-1',
        moduleId: 'module-1',
        title: 'Quiz module',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: null,
        nombreTentatives: 3,
        questions: [],
      },
    ];

    mockUseGetModuleById.mockReturnValue({
      module: {
        id: 'module-1',
        title: 'Module',
        description: 'Desc',
        thematics: 'budget',
        imageMediaId: null,
        difficultyLevel: 'BEGINNER',
        estimatedDuration: 100,
        status: 'PUBLISHED',
        lessons: [
          {
            id: 'lesson-1',
            title: 'L1',
            description: 'Desc',
            duration: 20,
            order: 1,
            status: LessonStatus.PUBLISHED,
            chapters: [
              { id: 'chapter-2', title: 'C2', description: 'D', order: 2 },
              { id: 'chapter-1', title: 'C1', description: 'D', order: 1 },
            ],
          },
          {
            id: 'lesson-2',
            title: 'L2',
            description: 'Desc',
            duration: 20,
            order: 2,
            status: LessonStatus.PUBLISHED,
            chapters: [{ id: 'chapter-3', title: 'C3', description: 'D', order: 1 }],
          },
        ],
        quizzesGlobal,
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetMediaById.mockReturnValue({ media: null });

    const progressMap = new Map<string, QuizProgressDTO>([
      [
        'chapter-quiz-1',
        {
          quizId: 'chapter-quiz-1',
          userId: 'user-1',
          totalAttempts: 1,
          maxAttempts: 3,
          remainingAttempts: 2,
          hasPassed: true,
          bestScorePercent: 90,
          lastScorePercent: 90,
          lastAttemptAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      [
        'lesson-quiz-1',
        {
          quizId: 'lesson-quiz-1',
          userId: 'user-1',
          totalAttempts: 1,
          maxAttempts: 3,
          remainingAttempts: 2,
          hasPassed: true,
          bestScorePercent: 90,
          lastScorePercent: 90,
          lastAttemptAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      [
        'chapter-quiz-2',
        {
          quizId: 'chapter-quiz-2',
          userId: 'user-1',
          totalAttempts: 1,
          maxAttempts: 3,
          remainingAttempts: 2,
          hasPassed: false,
          bestScorePercent: 40,
          lastScorePercent: 40,
          lastAttemptAt: '2025-01-01T00:00:00.000Z',
        },
      ],
      [
        'module-quiz-1',
        {
          quizId: 'module-quiz-1',
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

    mockUseQuizProgressMap.mockReturnValue({ progressMap });

    render(<ModuleDetailClient moduleId='module-1' />);

    const props = moduleTabsMock.mock.calls[0][0] as {
      quizAvailability: Map<string, boolean>;
    };

    expect(props.quizAvailability.get('chapter-quiz-1')).toBe(true);
    expect(props.quizAvailability.get('lesson-quiz-1')).toBe(true);
    expect(props.quizAvailability.get('module-quiz-1')).toBe(false);
  });

  it('locks later lessons when earlier one is incomplete and uses fallbacks', () => {
    const quizzesGlobal: Quiz[] = [
      {
        id: 'chapter-quiz-1',
        moduleId: 'module-1',
        lessonId: 'lesson-1',
        chapterId: 'chapter-1',
        title: 'Quiz chapitre 1',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: null,
        nombreTentatives: 3,
        questions: [],
      },
      {
        id: 'lesson-quiz-2',
        moduleId: 'module-1',
        lessonId: 'lesson-2',
        chapterId: null,
        title: 'Quiz leçon 2',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: null,
        nombreTentatives: 3,
        questions: [],
      },
      {
        id: 'lesson-quiz-missing',
        moduleId: 'module-1',
        lessonId: 'lesson-missing',
        chapterId: null,
        title: 'Quiz manquant',
        description: 'Desc',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 60,
        duree: null,
        nombreTentatives: 3,
        questions: [],
      },
    ];

    mockUseGetModuleById.mockReturnValue({
      module: {
        id: undefined,
        title: 'Module',
        description: 'Desc',
        thematics: 'budget',
        imageMediaId: null,
        difficultyLevel: undefined,
        estimatedDuration: 100,
        status: 'PUBLISHED',
        lessons: [
          {
            id: 'lesson-1',
            title: 'L1',
            description: 'Desc',
            duration: 20,
            order: undefined,
            status: LessonStatus.PUBLISHED,
            chapters: [{ id: 'chapter-1', title: 'C1', description: 'D', order: 1 }],
          },
          {
            id: 'lesson-2',
            title: 'L2',
            description: 'Desc',
            duration: 20,
            order: 2,
            status: LessonStatus.PUBLISHED,
            chapters: undefined,
          },
        ],
        quizzesGlobal,
      },
      isLoading: false,
      isError: false,
    });

    mockUseGetMediaById.mockReturnValue({ media: null });

    const progressMap = new Map<string, QuizProgressDTO>([
      [
        'chapter-quiz-1',
        {
          quizId: 'chapter-quiz-1',
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

    mockUseQuizProgressMap.mockReturnValue({ progressMap });

    render(<ModuleDetailClient moduleId='module-1' />);

    expect(screen.getByText('Niveau')).toBeInTheDocument();

    const props = moduleTabsMock.mock.calls[0][0] as {
      quizAvailability: Map<string, boolean>;
    };

    expect(props.quizAvailability.get('lesson-quiz-2')).toBe(false);
    expect(props.quizAvailability.get('lesson-quiz-missing')).toBe(false);
  });
});
