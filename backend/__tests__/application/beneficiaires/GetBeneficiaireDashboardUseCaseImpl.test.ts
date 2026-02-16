import { GetBeneficiaireDashboardUseCaseImpl } from '@/application/beneficiaires/use-cases/GetBeneficiaireDashboardUseCaseImpl';
import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { MediaProgressRepository } from '@/domain/streaming/ports/out/MediaProgressRepository';
import { ModuleStatus } from '@/domain/formations/entities/ModuleFormation';
import { BeneficiaryStatus, Beneficiary } from '@/domain/Beneficiary/entities/Beneficiary';

describe('GetBeneficiaireDashboardUseCaseImpl', () => {
  let useCase: GetBeneficiaireDashboardUseCaseImpl;
  let mockBeneficiaryRepo: jest.Mocked<BeneficiaryRepository>;
  let mockModuleRepo: jest.Mocked<ModuleRepository>;
  let mockMediaProgressRepo: jest.Mocked<MediaProgressRepository>;

  const createMockModule = (
    overrides: {
      status?: ModuleStatus;
      id?: string;
      title?: string;
      lessons?: Array<{
        title?: string;
        chapters: Array<{
          id?: { getValue: () => string };
          title?: string;
          mediaId?: string;
        }>;
      }>;
    } = {}
  ) => {
    const id = overrides.id ?? 'mod-1';
    const defaultLesson = {
      title: 'Lesson 1',
      chapters: [
        { id: { getValue: () => 'ch-1' }, title: 'Chapter', mediaId: 'media-1' },
      ] as Array<{ id: { getValue: () => string }; title: string; mediaId?: string }>,
    };
    const lessons = overrides.lessons ?? [defaultLesson];
    return {
      id: typeof id === 'string' ? { getValue: () => id } : id,
      title: overrides.title ?? 'Module 1',
      status: overrides.status ?? ModuleStatus.PUBLISHED,
      lessons: lessons.map((l, i) => ({
        title: l.title ?? `Lesson ${i + 1}`,
        chapters: (l.chapters || []).map((c, j) => ({
          id: c.id ?? { getValue: () => `ch-${j}` },
          title: c.title ?? 'Chapter',
          mediaId: c.mediaId,
        })),
      })),
    };
  };

  const createMockProgress = (
    overrides: {
      mediaId?: string;
      isCompleted?: boolean;
      currentPosition?: number;
      lastWatchedAt?: Date;
      duration?: number;
      completionRate?: number;
    } = {}
  ) => ({
    id: 'prog-1',
    userId: 'clerk-1',
    mediaId: overrides.mediaId ?? 'media-1',
    isCompleted: overrides.isCompleted ?? false,
    currentPosition: overrides.currentPosition ?? 0,
    lastWatchedAt: overrides.lastWatchedAt ?? new Date(),
    duration: overrides.duration ?? 300,
    completionRate: overrides.completionRate ?? 0,
  });

  beforeEach(() => {
    mockBeneficiaryRepo = {
      findByClerkUserId: jest.fn(),
      findByOrgId: jest.fn(),
      findByOrgAndEmail: jest.fn(),
      findByIdInOrg: jest.fn(),
      create: jest.fn(),
      updateInOrg: jest.fn(),
      deleteByIdAndOrgId: jest.fn(),
    } as jest.Mocked<BeneficiaryRepository>;

    mockModuleRepo = {
      findAll: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByTitle: jest.fn(),
      findByTitleExceptId: jest.fn(),
      findByThematic: jest.fn(),
      findByThematicExceptId: jest.fn(),
      update: jest.fn(),
    } as jest.Mocked<ModuleRepository>;

    mockMediaProgressRepo = {
      findByUser: jest.fn(),
      findByUserAndMedia: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
      findRecentByUser: jest.fn(),
    } as jest.Mocked<MediaProgressRepository>;

    useCase = new GetBeneficiaireDashboardUseCaseImpl(
      mockBeneficiaryRepo,
      mockModuleRepo,
      mockMediaProgressRepo
    );
  });

  describe('execute', () => {
    it('should return dashboard with zeros when no modules and no progress', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 5000, total: 0, totalPages: 0 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.modulesCompleted).toEqual({ current: 0, total: 0 });
      expect(result.stats.learningTime).toBe('0m');
      expect(result.stats.globalProgress).toBe(0);
      expect(result.stats.modulesCompletedTrend).toBe('+0 ce mois');
      expect(result.stats.learningTimeTrend).toBe('+0m cette semaine');
      expect(result.stats.globalProgressTrend).toBe('+0% ce mois');
      expect(result.stats.quizzesPassedTrend).toBe('0% de réussite');
      expect(result.moduleStats).toEqual({
        completed: 0,
        inProgress: 0,
        notStarted: 0,
        total: 0,
      });
      expect(result.monthlyProgress).toHaveLength(6);
    });

    it('should use beneficiary progressPercent when no modules', async () => {
      const beneficiary = new Beneficiary(
        'ben-1',
        'org-1',
        'clerk-1',
        'Jean',
        'Dupont',
        'j@test.com',
        null,
        BeneficiaryStatus.ACTIVE,
        42,
        new Date(),
        new Date()
      );
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(beneficiary);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 5000, total: 0, totalPages: 0 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.globalProgress).toBe(42);
    });

    it('should return dashboard with one published module and no progress', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [createMockModule()] as any,
        pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 5000, total: 0, totalPages: 0 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.modulesCompleted).toEqual({ current: 0, total: 1 });
      expect(result.moduleStats).toEqual({
        completed: 0,
        inProgress: 0,
        notStarted: 1,
        total: 1,
      });
      expect(result.monthlyProgress).toHaveLength(6);
    });

    it('should filter only published modules', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [
          createMockModule({ status: ModuleStatus.PUBLISHED }),
          createMockModule({ status: ModuleStatus.DRAFT }),
          createMockModule({ status: ModuleStatus.ARCHIVED }),
        ] as any,
        pagination: { page: 1, limit: 500, total: 3, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 5000, total: 0, totalPages: 0 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.modulesCompleted.total).toBe(1);
      expect(result.moduleStats.total).toBe(1);
    });

    it('should count completed module when all media completed', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [
          createMockModule({ lessons: [{ chapters: [{ mediaId: 'm1' }, { mediaId: 'm2' }] }] }),
        ] as any,
        pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({ mediaId: 'm1', isCompleted: true, lastWatchedAt: new Date() }),
          createMockProgress({ mediaId: 'm2', isCompleted: true, lastWatchedAt: new Date() }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 2, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.moduleStats.completed).toBe(1);
      expect(result.moduleStats.inProgress).toBe(0);
      expect(result.moduleStats.notStarted).toBe(0);
      expect(result.stats.globalProgress).toBe(100);
    });

    it('should count in-progress module when some media started', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [
          createMockModule({ lessons: [{ chapters: [{ mediaId: 'm1' }, { mediaId: 'm2' }] }] }),
        ] as any,
        pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [createMockProgress({ mediaId: 'm1', isCompleted: false })] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.moduleStats.completed).toBe(0);
      expect(result.moduleStats.inProgress).toBe(1);
      expect(result.moduleStats.notStarted).toBe(0);
    });

    it('should skip module with no mediaIds', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [
          createMockModule({ lessons: [{ chapters: [] }] }),
          createMockModule({ lessons: [{ chapters: [{}] }] }),
        ] as any,
        pagination: { page: 1, limit: 500, total: 2, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 5000, total: 0, totalPages: 0 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.moduleStats.completed).toBe(0);
      expect(result.moduleStats.inProgress).toBe(0);
      expect(result.moduleStats.notStarted).toBe(2);
    });

    it('should format learning time correctly (1h 1m)', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({ currentPosition: 3661 }), // 1h 1m 1s
        ] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.learningTime).toBe('1h 1m');
    });

    it('should format learning time as hours only when no minutes', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [createMockProgress({ currentPosition: 7200 })] as any, // 2h
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.learningTime).toBe('2h');
    });

    it('should format learning time as minutes only when under one hour', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [createMockProgress({ currentPosition: 2700 })] as any, // 45m
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.learningTime).toBe('45m');
    });

    it('should set learningTimeTrend with positive time when progress this week', async () => {
      const now = new Date();
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({
            currentPosition: 600,
            lastWatchedAt: now,
          }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.learningTimeTrend).toMatch(/\+10m cette semaine/);
    });

    it('should call repositories with correct params', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 5000, total: 0, totalPages: 0 },
      });

      await useCase.execute({ clerkUserId: 'user_xyz' });

      expect(mockBeneficiaryRepo.findByClerkUserId).toHaveBeenCalledWith('user_xyz');
      expect(mockModuleRepo.findAll).toHaveBeenCalledWith({ page: 1, limit: 500 });
      expect(mockMediaProgressRepo.findByUser).toHaveBeenCalledWith('user_xyz', {
        page: 1,
        limit: 5000,
      });
    });

    it('should handle progressResult.data undefined with empty array', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: undefined as any,
        pagination: { page: 1, limit: 5000, total: 0, totalPages: 0 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.learningTime).toBe('0m');
      expect(result.monthlyProgress).toHaveLength(6);
    });

    it('should include trends in stats', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [createMockModule()] as any,
        pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 5000, total: 0, totalPages: 0 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats).toHaveProperty('modulesCompletedTrend');
      expect(result.stats).toHaveProperty('learningTimeTrend');
      expect(result.stats).toHaveProperty('globalProgressTrend');
      expect(result.stats).toHaveProperty('quizzesPassedTrend');
    });

    it('should set modulesCompletedTrend to +N ce mois when modules completed this month', async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [createMockModule({ lessons: [{ chapters: [{ mediaId: 'm1' }] }] })] as any,
        pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({
            mediaId: 'm1',
            isCompleted: true,
            lastWatchedAt: startOfMonth,
          }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.modulesCompletedTrend).toBe('+1 ce mois');
    });

    it('should set globalProgressTrend to +X% ce mois when progress increased this month', async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [createMockModule({ lessons: [{ chapters: [{ mediaId: 'm1' }] }] })] as any,
        pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({
            mediaId: 'm1',
            isCompleted: true,
            lastWatchedAt: startOfMonth,
          }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.globalProgress).toBe(100);
      expect(result.stats.globalProgressTrend).toBe('+100% ce mois');
    });

    it('should set globalProgressTrend to +0% ce mois when no new completions this month', async () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [createMockModule({ lessons: [{ chapters: [{ mediaId: 'm1' }] }] })] as any,
        pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({
            mediaId: 'm1',
            isCompleted: true,
            lastWatchedAt: lastMonth,
          }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.globalProgress).toBe(100);
      expect(result.stats.globalProgressTrend).toBe('+0% ce mois');
    });

    it('should compute globalProgress 50% when one of two modules completed', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [
          createMockModule({ lessons: [{ chapters: [{ mediaId: 'm1' }] }] }),
          createMockModule({ lessons: [{ chapters: [{ mediaId: 'm2' }] }] }),
        ] as any,
        pagination: { page: 1, limit: 500, total: 2, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({ mediaId: 'm1', isCompleted: true, lastWatchedAt: new Date() }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.globalProgress).toBe(50);
      expect(result.moduleStats.completed).toBe(1);
      expect(result.moduleStats.notStarted).toBe(1);
    });

    it('should populate monthlyProgress with completed progress in current month', async () => {
      const now = new Date();
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({
            isCompleted: true,
            lastWatchedAt: now,
          }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.monthlyProgress).toHaveLength(6);
      const currentMonthLabel = [
        'Jan',
        'Fév',
        'Mar',
        'Avr',
        'Mai',
        'Juin',
        'Juil',
        'Aoû',
        'Sep',
        'Oct',
        'Nov',
        'Déc',
      ][now.getMonth()];
      const currentMonthEntry = result.monthlyProgress.find(m => m.month === currentMonthLabel);
      expect(currentMonthEntry).toBeDefined();
      expect(currentMonthEntry!.progress).toBe(1);
    });

    it('should not add moduleCompletionDates when completed module has no lastWatchedAt on progress', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [createMockModule({ lessons: [{ chapters: [{ mediaId: 'm1' }] }] })] as any,
        pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
      });
      // lastWatchedAt in 1970 so not in current month -> modulesCompletedTrend +0 ce mois
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({
            mediaId: 'm1',
            isCompleted: true,
            lastWatchedAt: new Date(0),
          }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.moduleStats.completed).toBe(1);
      expect(result.stats.modulesCompletedTrend).toBe('+0 ce mois');
    });

    it('should return quizzesPassed and quizzesPassedTrend in stats', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 5000, total: 0, totalPages: 0 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.quizzesPassed).toEqual({ current: 0, total: 0 });
      expect(result.stats.quizzesPassedTrend).toBe('0% de réussite');
    });

    it('should compute averageSessionTime from progress grouped by day', async () => {
      const sameDay = new Date();
      sameDay.setHours(10, 0, 0, 0);
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({ currentPosition: 600, lastWatchedAt: sameDay }),
          createMockProgress({
            mediaId: 'media-2',
            currentPosition: 300,
            lastWatchedAt: new Date(sameDay.getTime()),
          }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 2, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.averageSessionTime).toBe('15m'); // 900s / 1 day = 900s -> 15m
    });

    it('should compute learningStreakDays when activity is today', async () => {
      const today = new Date();
      today.setHours(14, 0, 0, 0);
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [createMockProgress({ currentPosition: 60, lastWatchedAt: today })] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.learningStreakDays).toBe(1);
    });

    it('should compute learningStreakDays with consecutive days (today and yesterday)', async () => {
      const today = new Date();
      today.setHours(12, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({ mediaId: 'm1', currentPosition: 60, lastWatchedAt: today }),
          createMockProgress({
            mediaId: 'm2',
            currentPosition: 60,
            lastWatchedAt: yesterday,
          }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 2, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.learningStreakDays).toBe(2);
    });

    it('should set videosWatchedTrend when videos completed this week', async () => {
      const now = new Date();
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 500, total: 0, totalPages: 0 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({
            mediaId: 'm1',
            isCompleted: true,
            lastWatchedAt: now,
            currentPosition: 100,
          }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.stats.videosWatchedTrend).toMatch(/\+1 cette semaine/);
    });

    it('should populate recentActivity when progress mediaId is in module chapters', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [
          createMockModule({
            lessons: [
              {
                chapters: [
                  {
                    id: { getValue: () => 'ch-1' },
                    title: 'Chapitre 1',
                    mediaId: 'media-1',
                  },
                ],
              },
            ],
          }),
        ] as any,
        pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({
            mediaId: 'media-1',
            currentPosition: 120,
            completionRate: 40,
            duration: 300,
            lastWatchedAt: new Date(),
          }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.recentActivity).toHaveLength(1);
      expect(result.recentActivity[0]).toMatchObject({
        chapterTitle: 'Chapitre 1',
        progress: 40,
        remainingTime: '3m',
      });
    });

    it('should exclude from recentActivity when progress mediaId is not in chapter map', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [
          createMockModule({
            lessons: [{ chapters: [{ mediaId: 'only-in-module' }] }],
          }),
        ] as any,
        pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({
            mediaId: 'orphan-media',
            currentPosition: 0,
            lastWatchedAt: new Date(),
          }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.recentActivity).toHaveLength(0);
    });

    it('should populate timeByModule with completionPercent when module has media', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [
          createMockModule({
            id: 'mod-1',
            title: 'Module A',
            lessons: [{ chapters: [{ mediaId: 'm1' }, { mediaId: 'm2' }] }],
          }),
        ] as any,
        pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({ mediaId: 'm1', isCompleted: true, currentPosition: 100 }),
          createMockProgress({ mediaId: 'm2', isCompleted: false, currentPosition: 50 }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 2, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.timeByModule).toHaveLength(1);
      expect(result.timeByModule[0].completionPercent).toBe(50);
      expect(result.timeByModule[0].totalSeconds).toBe(150);
    });

    it('should add module to timeByModuleMap when module has at least one media', async () => {
      mockBeneficiaryRepo.findByClerkUserId.mockResolvedValue(null);
      mockModuleRepo.findAll.mockResolvedValue({
        data: [
          createMockModule({
            id: 'mod-with-media',
            title: 'Module with media',
            lessons: [{ chapters: [{ mediaId: 'media-x' }] }],
          }),
        ] as any,
        pagination: { page: 1, limit: 500, total: 1, totalPages: 1 },
      });
      mockMediaProgressRepo.findByUser.mockResolvedValue({
        data: [
          createMockProgress({
            mediaId: 'media-x',
            currentPosition: 45,
            lastWatchedAt: new Date(),
          }),
        ] as any,
        pagination: { page: 1, limit: 5000, total: 1, totalPages: 1 },
      });

      const result = await useCase.execute({ clerkUserId: 'clerk-1' });

      expect(result.timeByModule).toHaveLength(1);
      expect(result.timeByModule[0].moduleTitle).toBe('Module with media');
      expect(result.timeByModule[0].totalSeconds).toBe(45);
    });
  });
});
