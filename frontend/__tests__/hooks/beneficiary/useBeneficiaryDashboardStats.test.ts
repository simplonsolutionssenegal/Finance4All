import { renderHook } from '@testing-library/react';

import { UserModuleStatus } from '@/types/learning-module';
import type { LearningModule } from '@/types/learning-module';
import type { ModuleProgressInfo } from '@/hooks/learning/useModulesWithProgress';

const mockUseGetLearningModules = jest.fn();
const mockUseModulesWithProgress = jest.fn();

jest.mock('@/hooks/module/useGetLearningModules', () => ({
  useGetLearningModules: () => mockUseGetLearningModules(),
}));

jest.mock('@/hooks/learning/useModulesWithProgress', () => ({
  useModulesWithProgress: () => mockUseModulesWithProgress(),
}));

import { useBeneficiaryDashboardStats } from '@/hooks/beneficiary/useBeneficiaryDashboardStats';

function makeModule(overrides: Partial<LearningModule> & { id: string }): LearningModule {
  return {
    title: 'Module',
    description: '',
    difficultyLevel: 'BEGINNER' as any,
    estimatedDuration: 30,
    status: 'PUBLISHED' as any,
    lessonCount: 3,
    userStatus: UserModuleStatus.AVAILABLE,
    progressPercent: 0,
    ...overrides,
  };
}

function makeProgress(overrides: Partial<ModuleProgressInfo> = {}): ModuleProgressInfo {
  return {
    progressPercent: 0,
    userStatus: UserModuleStatus.AVAILABLE,
    completedLessons: 0,
    totalLessons: 3,
    quizzesPassed: 0,
    totalQuizzes: 2,
    averageScore: 0,
    hasStarted: false,
    ...overrides,
  };
}

describe('useBeneficiaryDashboardStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading state when modules are loading', () => {
    mockUseGetLearningModules.mockReturnValue({ modules: [], isLoading: true });
    mockUseModulesWithProgress.mockReturnValue({
      enrichedModules: [],
      progressByModule: new Map(),
      isLoading: false,
    });

    const { result } = renderHook(() => useBeneficiaryDashboardStats());

    expect(result.current.isLoading).toBe(true);
  });

  it('returns loading state when progress is loading', () => {
    mockUseGetLearningModules.mockReturnValue({ modules: [], isLoading: false });
    mockUseModulesWithProgress.mockReturnValue({
      enrichedModules: [],
      progressByModule: new Map(),
      isLoading: true,
    });

    const { result } = renderHook(() => useBeneficiaryDashboardStats());

    expect(result.current.isLoading).toBe(true);
  });

  it('computes correct stats with mixed module statuses', () => {
    const modules = [
      makeModule({ id: 'm1', estimatedDuration: 60 }),
      makeModule({ id: 'm2', estimatedDuration: 30 }),
      makeModule({ id: 'm3', estimatedDuration: 90 }),
    ];

    const progressByModule = new Map<string, ModuleProgressInfo>([
      [
        'm1',
        makeProgress({
          progressPercent: 100,
          userStatus: UserModuleStatus.COMPLETED,
          quizzesPassed: 2,
          totalQuizzes: 2,
        }),
      ],
      [
        'm2',
        makeProgress({
          progressPercent: 50,
          userStatus: UserModuleStatus.IN_PROGRESS,
          quizzesPassed: 1,
          totalQuizzes: 2,
        }),
      ],
      [
        'm3',
        makeProgress({
          progressPercent: 0,
          userStatus: UserModuleStatus.AVAILABLE,
          quizzesPassed: 0,
          totalQuizzes: 3,
        }),
      ],
    ]);

    const enrichedModules = [
      makeModule({ id: 'm1', estimatedDuration: 60, userStatus: UserModuleStatus.COMPLETED }),
      makeModule({ id: 'm2', estimatedDuration: 30, userStatus: UserModuleStatus.IN_PROGRESS }),
      makeModule({ id: 'm3', estimatedDuration: 90, userStatus: UserModuleStatus.AVAILABLE }),
    ];

    mockUseGetLearningModules.mockReturnValue({ modules, isLoading: false });
    mockUseModulesWithProgress.mockReturnValue({
      enrichedModules,
      progressByModule,
      isLoading: false,
    });

    const { result } = renderHook(() => useBeneficiaryDashboardStats());

    expect(result.current.stats.modulesCompleted).toEqual({ current: 1, total: 3 });
    expect(result.current.stats.quizzesPassed).toEqual({ current: 3, total: 7 });
    expect(result.current.stats.globalProgress).toBe(50); // Math.round((100 + 50 + 0) / 3) = 50
    expect(result.current.moduleStats).toEqual({
      completed: 1,
      inProgress: 1,
      notStarted: 1,
      total: 3,
    });
  });

  it('handles empty modules array', () => {
    mockUseGetLearningModules.mockReturnValue({ modules: [], isLoading: false });
    mockUseModulesWithProgress.mockReturnValue({
      enrichedModules: [],
      progressByModule: new Map(),
      isLoading: false,
    });

    const { result } = renderHook(() => useBeneficiaryDashboardStats());

    expect(result.current.stats.modulesCompleted).toEqual({ current: 0, total: 0 });
    expect(result.current.stats.learningTime).toBe('0m');
    expect(result.current.stats.quizzesPassed).toEqual({ current: 0, total: 0 });
    expect(result.current.stats.globalProgress).toBe(0);
    expect(result.current.moduleStats).toEqual({
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      total: 0,
    });
  });

  it('formats learning time as minutes only when under 60', () => {
    const modules = [makeModule({ id: 'm1', estimatedDuration: 45 })];
    const progressByModule = new Map<string, ModuleProgressInfo>([
      [
        'm1',
        makeProgress({
          progressPercent: 100,
          userStatus: UserModuleStatus.COMPLETED,
          quizzesPassed: 1,
          totalQuizzes: 1,
        }),
      ],
    ]);
    const enrichedModules = [
      makeModule({ id: 'm1', estimatedDuration: 45, userStatus: UserModuleStatus.COMPLETED }),
    ];

    mockUseGetLearningModules.mockReturnValue({ modules, isLoading: false });
    mockUseModulesWithProgress.mockReturnValue({
      enrichedModules,
      progressByModule,
      isLoading: false,
    });

    const { result } = renderHook(() => useBeneficiaryDashboardStats());

    // 45 * (100/100) = 45 minutes => "45m"
    expect(result.current.stats.learningTime).toBe('45m');
  });

  it('formats learning time as hours and minutes when over 60', () => {
    const modules = [
      makeModule({ id: 'm1', estimatedDuration: 90 }),
      makeModule({ id: 'm2', estimatedDuration: 60 }),
    ];
    const progressByModule = new Map<string, ModuleProgressInfo>([
      [
        'm1',
        makeProgress({
          progressPercent: 100,
          userStatus: UserModuleStatus.COMPLETED,
          quizzesPassed: 1,
          totalQuizzes: 1,
        }),
      ],
      [
        'm2',
        makeProgress({
          progressPercent: 50,
          userStatus: UserModuleStatus.IN_PROGRESS,
          quizzesPassed: 0,
          totalQuizzes: 1,
        }),
      ],
    ]);
    const enrichedModules = [
      makeModule({ id: 'm1', estimatedDuration: 90, userStatus: UserModuleStatus.COMPLETED }),
      makeModule({ id: 'm2', estimatedDuration: 60, userStatus: UserModuleStatus.IN_PROGRESS }),
    ];

    mockUseGetLearningModules.mockReturnValue({ modules, isLoading: false });
    mockUseModulesWithProgress.mockReturnValue({
      enrichedModules,
      progressByModule,
      isLoading: false,
    });

    const { result } = renderHook(() => useBeneficiaryDashboardStats());

    // m1: 90 * 1.0 = 90, m2: 60 * 0.5 = 30 => total = 120 => "2h"
    expect(result.current.stats.learningTime).toBe('2h');
  });

  it('formats learning time as hours with remaining minutes', () => {
    const modules = [makeModule({ id: 'm1', estimatedDuration: 100 })];
    const progressByModule = new Map<string, ModuleProgressInfo>([
      [
        'm1',
        makeProgress({
          progressPercent: 100,
          userStatus: UserModuleStatus.COMPLETED,
          quizzesPassed: 1,
          totalQuizzes: 1,
        }),
      ],
    ]);
    const enrichedModules = [
      makeModule({ id: 'm1', estimatedDuration: 100, userStatus: UserModuleStatus.COMPLETED }),
    ];

    mockUseGetLearningModules.mockReturnValue({ modules, isLoading: false });
    mockUseModulesWithProgress.mockReturnValue({
      enrichedModules,
      progressByModule,
      isLoading: false,
    });

    const { result } = renderHook(() => useBeneficiaryDashboardStats());

    // 100 * 1.0 = 100 minutes => 1h 40m
    expect(result.current.stats.learningTime).toBe('1h 40m');
  });

  it('computes global progress as average of all module progress percentages', () => {
    const modules = [
      makeModule({ id: 'm1', estimatedDuration: 30 }),
      makeModule({ id: 'm2', estimatedDuration: 30 }),
    ];
    const progressByModule = new Map<string, ModuleProgressInfo>([
      ['m1', makeProgress({ progressPercent: 80, userStatus: UserModuleStatus.IN_PROGRESS })],
      ['m2', makeProgress({ progressPercent: 40, userStatus: UserModuleStatus.IN_PROGRESS })],
    ]);
    const enrichedModules = [
      makeModule({ id: 'm1', estimatedDuration: 30, userStatus: UserModuleStatus.IN_PROGRESS }),
      makeModule({ id: 'm2', estimatedDuration: 30, userStatus: UserModuleStatus.IN_PROGRESS }),
    ];

    mockUseGetLearningModules.mockReturnValue({ modules, isLoading: false });
    mockUseModulesWithProgress.mockReturnValue({
      enrichedModules,
      progressByModule,
      isLoading: false,
    });

    const { result } = renderHook(() => useBeneficiaryDashboardStats());

    // (80 + 40) / 2 = 60
    expect(result.current.stats.globalProgress).toBe(60);
  });
});
