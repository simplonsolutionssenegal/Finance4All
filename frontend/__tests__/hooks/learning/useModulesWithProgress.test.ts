import { renderHook } from '@testing-library/react';
import { useQueries } from '@tanstack/react-query';

import { useModulesWithProgress } from '@/hooks/learning/useModulesWithProgress';
import { UserModuleStatus, type LearningModule } from '@/types/learning-module';
import { QuizStatus } from '@/types/learning/lesson';
import { useMediaProgressMap } from '@/hooks/media/useMediaProgressMap';
import { useQuizProgressMap } from '@/hooks/quiz/useQuizProgressMap';
import { isChapterViewed } from '@/lib/learning/chapter-progress';
import { mapQuizzes } from '@/lib/learning/learning-adapters';
import { DifficultyLevel, ModuleStatus } from '@/types/modules/module';

// ── Mocks ──────────────────────────────────────────────────────────────────────

jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn(() => ({ getToken: jest.fn() })),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueries: jest.fn(),
}));

jest.mock('@/lib/api-client', () => ({
  apiClient: jest.fn(),
}));

jest.mock('@/hooks/media/useMediaProgressMap', () => ({
  useMediaProgressMap: jest.fn(),
}));

jest.mock('@/hooks/quiz/useQuizProgressMap', () => ({
  useQuizProgressMap: jest.fn(),
}));

jest.mock('@/lib/learning/chapter-progress', () => ({
  isChapterViewed: jest.fn(),
}));

jest.mock('@/lib/learning/learning-adapters', () => ({
  mapQuizzes: jest.fn(() => []),
}));

// ── Helpers ────────────────────────────────────────────────────────────────────

const mockedUseQueries = useQueries as jest.Mock;
const mockedUseMediaProgressMap = useMediaProgressMap as jest.Mock;
const mockedUseQuizProgressMap = useQuizProgressMap as jest.Mock;
const mockedIsChapterViewed = isChapterViewed as jest.Mock;
const mockedMapQuizzes = mapQuizzes as jest.Mock;

function makeLearningModule(overrides: Partial<LearningModule> = {}): LearningModule {
  return {
    id: 'mod-1',
    title: 'Module 1',
    description: 'Desc',
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status: ModuleStatus.PUBLISHED,
    lessonCount: 2,
    userStatus: UserModuleStatus.AVAILABLE,
    progressPercent: 0,
    ...overrides,
  };
}

/**
 * Build a backend module detail response that `useQueries` would return.
 */
function makeModuleDetail(
  moduleId: string,
  lessons: Array<{
    id: string;
    order: number;
    status?: string;
    chapters: Array<{ id: string; mediaId?: string; order?: number }>;
  }>,
  quizzesGlobal: Array<{
    id: string;
    lessonId?: string;
    chapterId?: string | null;
    status?: string;
  }> = []
) {
  return {
    id: moduleId,
    title: 'Module detail',
    description: '',
    thematics: '',
    imageMediaId: null,
    difficultyLevel: DifficultyLevel.BEGINNER,
    estimatedDuration: 60,
    status: ModuleStatus.PUBLISHED,
    createdAt: '',
    updatedAt: '',
    lessons: lessons.map(l => ({
      id: l.id,
      title: `Lesson ${l.id}`,
      description: '',
      duration: 30,
      order: l.order,
      status: l.status ?? 'PUBLISHED',
      chapters: l.chapters.map(ch => ({
        id: ch.id,
        title: `Chapter ${ch.id}`,
        description: '',
        mediaId: ch.mediaId ?? null,
        order: ch.order ?? 0,
      })),
    })),
    quizzes: [],
    quizzesGlobal: quizzesGlobal.map(q => ({
      id: q.id,
      title: `Quiz ${q.id}`,
      description: '',
      status: q.status ?? 'PUBLISHED',
      lessonId: q.lessonId,
      chapterId: q.chapterId ?? null,
    })),
  };
}

function setupDefaultProgressMocks() {
  mockedUseMediaProgressMap.mockReturnValue({
    mediaProgressMap: new Map(),
    isLoading: false,
  });
  mockedUseQuizProgressMap.mockReturnValue({
    progressMap: new Map(),
    isLoading: false,
  });
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('useModulesWithProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultProgressMocks();
    mockedIsChapterViewed.mockReturnValue(false);
    mockedMapQuizzes.mockReturnValue([]);
  });

  // 1. Loading state
  it('returns loading when module detail queries are loading', () => {
    const modules = [makeLearningModule({ id: 'mod-1' })];

    mockedUseQueries.mockReturnValue([{ data: undefined, isLoading: true }]);

    const { result } = renderHook(() => useModulesWithProgress(modules));

    expect(result.current.isLoading).toBe(true);
  });

  // 2. Empty modules
  it('returns empty progress for empty modules array', () => {
    mockedUseQueries.mockReturnValue([]);

    const { result } = renderHook(() => useModulesWithProgress([]));

    expect(result.current.enrichedModules).toEqual([]);
    expect(result.current.progressByModule.size).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  // 3. All lessons completed
  it('computes progress correctly for a module with all lessons completed', () => {
    const modules = [makeLearningModule({ id: 'mod-1' })];

    const detail = makeModuleDetail('mod-1', [
      { id: 'les-1', order: 1, chapters: [{ id: 'ch-1', mediaId: 'media-1' }] },
      { id: 'les-2', order: 2, chapters: [{ id: 'ch-2', mediaId: 'media-2' }] },
    ]);

    mockedUseQueries.mockReturnValue([{ data: { success: true, data: detail }, isLoading: false }]);

    mockedIsChapterViewed.mockReturnValue(true);

    mockedUseMediaProgressMap.mockReturnValue({
      mediaProgressMap: new Map([
        ['media-1', { isCompleted: true }],
        ['media-2', { isCompleted: true }],
      ]),
      isLoading: false,
    });

    const { result } = renderHook(() => useModulesWithProgress(modules));

    const progress = result.current.progressByModule.get('mod-1');
    expect(progress).toBeDefined();
    expect(progress!.progressPercent).toBe(100);
    expect(progress!.completedLessons).toBe(2);
    expect(progress!.totalLessons).toBe(2);
    expect(progress!.hasStarted).toBe(true);
  });

  // 4. IN_PROGRESS status when some chapters are viewed
  it('computes IN_PROGRESS status when some chapters are viewed', () => {
    const modules = [makeLearningModule({ id: 'mod-1' })];

    const detail = makeModuleDetail('mod-1', [
      {
        id: 'les-1',
        order: 1,
        chapters: [
          { id: 'ch-1', mediaId: 'media-1' },
          { id: 'ch-2', mediaId: 'media-2' },
        ],
      },
    ]);

    mockedUseQueries.mockReturnValue([{ data: { success: true, data: detail }, isLoading: false }]);

    // ch-1 viewed, ch-2 not viewed
    mockedIsChapterViewed.mockImplementation((id: string) => id === 'ch-1');

    mockedUseMediaProgressMap.mockReturnValue({
      mediaProgressMap: new Map([
        ['media-1', { isCompleted: true }],
        ['media-2', { isCompleted: false }],
      ]),
      isLoading: false,
    });

    const { result } = renderHook(() => useModulesWithProgress(modules));

    const progress = result.current.progressByModule.get('mod-1');
    expect(progress).toBeDefined();
    expect(progress!.userStatus).toBe(UserModuleStatus.IN_PROGRESS);
    expect(progress!.progressPercent).toBe(50);
    expect(progress!.hasStarted).toBe(true);
  });

  // 5. AVAILABLE status when no chapters viewed
  it('computes AVAILABLE status when no chapters viewed', () => {
    const modules = [makeLearningModule({ id: 'mod-1' })];

    const detail = makeModuleDetail('mod-1', [
      { id: 'les-1', order: 1, chapters: [{ id: 'ch-1', mediaId: 'media-1' }] },
    ]);

    mockedUseQueries.mockReturnValue([{ data: { success: true, data: detail }, isLoading: false }]);

    mockedIsChapterViewed.mockReturnValue(false);

    mockedUseMediaProgressMap.mockReturnValue({
      mediaProgressMap: new Map([['media-1', { isCompleted: false }]]),
      isLoading: false,
    });

    const { result } = renderHook(() => useModulesWithProgress(modules));

    const progress = result.current.progressByModule.get('mod-1');
    expect(progress).toBeDefined();
    expect(progress!.userStatus).toBe(UserModuleStatus.AVAILABLE);
    expect(progress!.progressPercent).toBe(0);
    expect(progress!.hasStarted).toBe(false);
  });

  // 6. COMPLETED status when progress is 100%
  it('computes COMPLETED status when progress is 100%', () => {
    const modules = [makeLearningModule({ id: 'mod-1' })];

    const detail = makeModuleDetail('mod-1', [
      { id: 'les-1', order: 1, chapters: [{ id: 'ch-1', mediaId: 'media-1' }] },
    ]);

    mockedUseQueries.mockReturnValue([{ data: { success: true, data: detail }, isLoading: false }]);

    mockedIsChapterViewed.mockReturnValue(true);

    mockedUseMediaProgressMap.mockReturnValue({
      mediaProgressMap: new Map([['media-1', { isCompleted: true }]]),
      isLoading: false,
    });

    const { result } = renderHook(() => useModulesWithProgress(modules));

    const progress = result.current.progressByModule.get('mod-1');
    expect(progress).toBeDefined();
    expect(progress!.userStatus).toBe(UserModuleStatus.COMPLETED);
    expect(progress!.progressPercent).toBe(100);
  });

  // 7. Quiz stats
  it('computes quiz stats correctly (passed/total, average score)', () => {
    const modules = [makeLearningModule({ id: 'mod-1' })];

    const detail = makeModuleDetail(
      'mod-1',
      [{ id: 'les-1', order: 1, chapters: [{ id: 'ch-1' }] }],
      [
        { id: 'quiz-1', chapterId: 'ch-1', status: 'PUBLISHED' },
        { id: 'quiz-2', chapterId: 'ch-1', status: 'PUBLISHED' },
      ]
    );

    mockedUseQueries.mockReturnValue([{ data: { success: true, data: detail }, isLoading: false }]);

    // mapQuizzes should return Quiz objects with PUBLISHED status
    mockedMapQuizzes.mockReturnValue([
      {
        id: 'quiz-1',
        moduleId: 'mod-1',
        chapterId: 'ch-1',
        lessonId: undefined,
        title: 'Quiz 1',
        description: '',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 0,
        duree: null,
        nombreTentatives: 0,
        questions: [],
      },
      {
        id: 'quiz-2',
        moduleId: 'mod-1',
        chapterId: 'ch-1',
        lessonId: undefined,
        title: 'Quiz 2',
        description: '',
        status: QuizStatus.PUBLISHED,
        scoreMinimum: 0,
        duree: null,
        nombreTentatives: 0,
        questions: [],
      },
    ]);

    mockedIsChapterViewed.mockReturnValue(false);

    mockedUseQuizProgressMap.mockReturnValue({
      progressMap: new Map([
        ['quiz-1', { hasPassed: true, bestScorePercent: 90 }],
        ['quiz-2', { hasPassed: false, bestScorePercent: 40 }],
      ]),
      isLoading: false,
    });

    const { result } = renderHook(() => useModulesWithProgress(modules));

    const progress = result.current.progressByModule.get('mod-1');
    expect(progress).toBeDefined();
    expect(progress!.totalQuizzes).toBe(2);
    expect(progress!.quizzesPassed).toBe(1);
    expect(progress!.averageScore).toBe(65); // (90 + 40) / 2 = 65
  });

  // 8. Enriches modules with computed progress
  it('enriches modules with computed progress', () => {
    const modules = [
      makeLearningModule({
        id: 'mod-1',
        progressPercent: 0,
        userStatus: UserModuleStatus.AVAILABLE,
      }),
    ];

    const detail = makeModuleDetail('mod-1', [
      { id: 'les-1', order: 1, chapters: [{ id: 'ch-1', mediaId: 'media-1' }] },
    ]);

    mockedUseQueries.mockReturnValue([{ data: { success: true, data: detail }, isLoading: false }]);

    mockedIsChapterViewed.mockReturnValue(true);

    mockedUseMediaProgressMap.mockReturnValue({
      mediaProgressMap: new Map([['media-1', { isCompleted: true }]]),
      isLoading: false,
    });

    const { result } = renderHook(() => useModulesWithProgress(modules));

    expect(result.current.enrichedModules).toHaveLength(1);
    const enriched = result.current.enrichedModules[0];
    expect(enriched.progressPercent).toBe(100);
    expect(enriched.userStatus).toBe(UserModuleStatus.COMPLETED);
    // Original fields are preserved
    expect(enriched.id).toBe('mod-1');
    expect(enriched.title).toBe('Module 1');
  });
});
