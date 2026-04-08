import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LessonDetailContent from '@/components/learning/LessonDetailContent';
import { QuizStatus, type Chapter, type Quiz } from '@/types/learning/lesson';
import type { QuizProgressDTO } from '@/types/learning/quiz-progress';

const mockUseSearchParams = jest.fn();
const mockReplace = jest.fn();
const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams(),
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => mockUsePathname(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('@/components/learning/ChapterMedia', () => ({
  __esModule: true,
  default: () => <div data-testid='chapter-media' />,
}));

const mockUseQuizProgressMap = jest.fn();
jest.mock('@/hooks/quiz/useQuizProgressMap', () => ({
  useQuizProgressMap: (quizIds: string[]) => mockUseQuizProgressMap(quizIds),
}));

jest.mock('@/hooks/media/useMediaProgressMap', () => ({
  useMediaProgressMap: jest.fn(() => ({
    mediaProgressMap: new Map(),
    isLoading: false,
  })),
}));

const mockIsChapterViewed = jest.fn((_id: string) => false);
jest.mock('@/lib/learning/chapter-progress', () => ({
  isChapterViewed: (id: string) => mockIsChapterViewed(id),
  markChapterViewed: jest.fn(),
  getViewedChapterIds: jest.fn(() => new Set()),
}));

const createChapter = (overrides: Partial<Chapter>): Chapter => ({
  id: 'chapter-1',
  lessonId: 'lesson-1',
  title: 'Chapitre 1',
  description: 'Description',
  order: 1,
  ...overrides,
});

const createQuiz = (overrides: Partial<Quiz>): Quiz => ({
  id: 'quiz-1',
  moduleId: 'module-1',
  lessonId: 'lesson-1',
  chapterId: 'chapter-1',
  isModuleQuiz: false,
  title: 'Quiz 1',
  description: 'Desc',
  status: QuizStatus.PUBLISHED,
  scoreMinimum: 60,
  nombreTentatives: 3,
  questions: [],
  ...overrides,
});

describe('LessonDetailContent', () => {
  beforeEach(() => {
    mockUseQuizProgressMap.mockReset();
    mockReplace.mockReset();
    mockIsChapterViewed.mockReset();
    // By default, chapters are viewed (unlocked) — individual tests override as needed
    mockIsChapterViewed.mockReturnValue(true);
    mockUsePathname.mockReturnValue('/learning/module-1/lesson/1');
    localStorage.clear();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it('shows quiz action and locks next chapter when quiz not passed', () => {
    // chapter-1 has not been viewed yet → chapter-2 stays locked
    mockIsChapterViewed.mockReturnValue(false);
    const chapters: Chapter[] = [
      createChapter({ id: 'chapter-1', order: 1 }),
      createChapter({ id: 'chapter-2', order: 2, title: 'Chapitre 2' }),
    ];
    const quizzes: Quiz[] = [createQuiz({ id: 'quiz-1', chapterId: 'chapter-1' })];
    const progressMap = new Map<string, QuizProgressDTO>([
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

    mockUseQuizProgressMap.mockReturnValue({ progressMap });

    render(
      <LessonDetailContent
        moduleId='module-1'
        lessonId='lesson-1'
        lessonTitle='Leçon'
        lessonDescription='Desc'
        chapters={chapters}
        quizzes={quizzes}
      />
    );

    const quizLink = screen.getByRole('link', { name: /quiz/i });
    expect(quizLink).toHaveAttribute('href', '/learning/module-1/quiz/quiz-1');

    const lockedChapter = screen.getByRole('button', { name: /chapitre 2/i });
    expect(lockedChapter).toBeDisabled();
  });

  it('shows next button when chapter quiz is passed', () => {
    const chapters: Chapter[] = [createChapter({ id: 'chapter-1', order: 1 })];
    const quizzes: Quiz[] = [createQuiz({ id: 'quiz-1', chapterId: 'chapter-1' })];
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
          bestScorePercent: 80,
          lastScorePercent: 80,
          lastAttemptAt: '2025-01-01T00:00:00.000Z',
        },
      ],
    ]);

    mockUseQuizProgressMap.mockReturnValue({ progressMap });

    render(
      <LessonDetailContent
        moduleId='module-1'
        lessonId='lesson-1'
        lessonTitle='Leçon'
        lessonDescription='Desc'
        chapters={chapters}
        quizzes={quizzes}
      />
    );

    expect(screen.getByRole('link', { name: /suivant/i })).toBeInTheDocument();
  });

  it('allows navigating between unlocked chapters', async () => {
    const user = userEvent.setup();
    mockUseSearchParams.mockReturnValue(new URLSearchParams('chapter=chapter-1'));
    // Simuler la mise à jour de l’URL quand router.replace est appelé (comme en prod)
    mockReplace.mockImplementation((url: string) => {
      const query = url.includes('?') ? url.split('?')[1] : '';
      mockUseSearchParams.mockReturnValue(new URLSearchParams(query));
    });
    const chapters: Chapter[] = [
      createChapter({ id: 'chapter-1', order: 1 }),
      createChapter({ id: 'chapter-2', order: 2, title: 'Chapitre 2' }),
    ];

    mockUseQuizProgressMap.mockReturnValue({ progressMap: new Map() });

    render(
      <LessonDetailContent
        moduleId='module-1'
        lessonId='lesson-1'
        lessonTitle='Leçon'
        lessonDescription='Desc'
        chapters={chapters}
        quizzes={[]}
      />
    );

    expect(screen.getByRole('heading', { name: /chapitre 1/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /suivant/i }));
    expect(screen.getByRole('heading', { name: /chapitre 2/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /précédent/i }));
    expect(screen.getByRole('heading', { name: /chapitre 1/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /chapitre 2/i }));
    expect(screen.getByRole('heading', { name: /chapitre 2/i })).toBeInTheDocument();
  });

  it('selects chapter from query params when available', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('chapter=chapter-2'));
    const chapters: Chapter[] = [
      createChapter({ id: 'chapter-1', order: 1 }),
      createChapter({ id: 'chapter-2', order: 2, title: 'Chapitre 2' }),
    ];

    mockUseQuizProgressMap.mockReturnValue({ progressMap: new Map() });

    render(
      <LessonDetailContent
        moduleId='module-1'
        lessonId='lesson-1'
        lessonTitle='Leçon'
        lessonDescription='Desc'
        chapters={chapters}
        quizzes={[]}
      />
    );

    expect(screen.getByRole('heading', { name: /chapitre 2/i })).toBeInTheDocument();
  });

  it('sets a default chapter when chapters become available', async () => {
    mockUseQuizProgressMap.mockReturnValue({ progressMap: new Map() });

    const { rerender } = render(
      <LessonDetailContent
        moduleId='module-1'
        lessonId='lesson-1'
        lessonTitle='Leçon'
        lessonDescription='Desc'
        chapters={[]}
        quizzes={[]}
      />
    );

    rerender(
      <LessonDetailContent
        moduleId='module-1'
        lessonId='lesson-1'
        lessonTitle='Leçon'
        lessonDescription='Desc'
        chapters={[createChapter({ id: 'chapter-1', order: 1 })]}
        quizzes={[]}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /chapitre 1/i })).toBeInTheDocument();
    });
  });

  it('renders chapter description as HTML', () => {
    const chapters: Chapter[] = [
      createChapter({
        id: 'chapter-1',
        order: 1,
        description: '<p><strong>Texte riche</strong></p>',
      }),
    ];

    mockUseQuizProgressMap.mockReturnValue({ progressMap: new Map() });

    render(
      <LessonDetailContent
        moduleId='module-1'
        lessonId='lesson-1'
        lessonTitle='Leçon'
        lessonDescription='Desc'
        chapters={chapters}
        quizzes={[]}
      />
    );

    const strong = screen.getByText('Texte riche');
    expect(strong.tagName).toBe('STRONG');
  });
});
