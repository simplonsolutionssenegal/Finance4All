import type { GetBeneficiaireDashboardUseCase } from '@/domain/Beneficiary/ports/in/GetBeneficiaireDashboardUseCase';
import type { BeneficiaireDashboardDTO } from '@/domain/Beneficiary/value-objects/BeneficiaireDashboardDTO';
import type { BeneficiaryRepository } from '@/domain/Beneficiary/ports/out/BeneficiaryRepository';
import type { ModuleRepository } from '@/domain/formations/ports/out/ModuleRepository';
import type { MediaProgressRepository } from '@/domain/streaming/ports/out/MediaProgressRepository';
import { ModuleStatus } from '@/domain/formations/entities/ModuleFormation';

const MONTH_LABELS = [
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
];

function formatLearningTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return '0m';
}

export class GetBeneficiaireDashboardUseCaseImpl implements GetBeneficiaireDashboardUseCase {
  constructor(
    private readonly beneficiaryRepository: BeneficiaryRepository,
    private readonly moduleRepository: ModuleRepository,
    private readonly mediaProgressRepository: MediaProgressRepository
  ) {}

  async execute(query: { clerkUserId: string }): Promise<BeneficiaireDashboardDTO> {
    const { clerkUserId } = query;

    const [beneficiary, modulesResult, progressResult] = await Promise.all([
      this.beneficiaryRepository.findByClerkUserId(clerkUserId),
      this.moduleRepository.findAll({ page: 1, limit: 500 }),
      this.mediaProgressRepository.findByUser(clerkUserId, { page: 1, limit: 5000 }),
    ]);

    const publishedModules = modulesResult.data.filter(m => m.status === ModuleStatus.PUBLISHED);
    const totalModules = publishedModules.length;
    const userProgressList = progressResult.data ?? [];

    const completedMediaIds = new Set(
      userProgressList.filter(p => p.isCompleted).map(p => p.mediaId)
    );
    const progressByMediaId = new Map(userProgressList.map(p => [p.mediaId, p]));

    // Calculate total videos and completed videos
    let totalVideos = 0;
    let completedVideos = 0;
    const mediaIdToChapterMap = new Map<
      string,
      { chapterId: string; chapterTitle: string; lessonTitle: string; moduleTitle: string }
    >();

    let completedCount = 0;
    let inProgressCount = 0;
    const moduleCompletionDates: Date[] = [];
    const timeByModuleMap = new Map<
      string,
      {
        moduleId: string;
        moduleTitle: string;
        totalSeconds: number;
        totalMedias: number;
        completedMedias: number;
      }
    >();

    for (const module of publishedModules) {
      const mediaIds: string[] = [];
      let moduleSeconds = 0;
      let moduleCompletedMedias = 0;

      for (const lesson of module.lessons) {
        for (const chapter of lesson.chapters) {
          if (chapter.mediaId) {
            totalVideos += 1;
            mediaIds.push(chapter.mediaId);
            mediaIdToChapterMap.set(chapter.mediaId, {
              chapterId: chapter.id.getValue(),
              chapterTitle: chapter.title,
              lessonTitle: lesson.title,
              moduleTitle: module.title,
            });

            if (completedMediaIds.has(chapter.mediaId)) {
              completedVideos += 1;
              moduleCompletedMedias += 1;
            }

            const progress = progressByMediaId.get(chapter.mediaId);
            if (progress) {
              moduleSeconds += progress.currentPosition;
            }
          }
        }
      }

      if (mediaIds.length > 0) {
        timeByModuleMap.set(module.id.getValue(), {
          moduleId: module.id.getValue(),
          moduleTitle: module.title,
          totalSeconds: moduleSeconds,
          totalMedias: mediaIds.length,
          completedMedias: moduleCompletedMedias,
        });
      }

      if (mediaIds.length === 0) {
        continue;
      }

      const completedForModule = mediaIds.every(id => completedMediaIds.has(id));
      const startedForModule = mediaIds.some(id => progressByMediaId.has(id));

      if (completedForModule) {
        completedCount += 1;
        const lastWatchedDates = mediaIds
          .map(id => progressByMediaId.get(id)?.lastWatchedAt)
          .filter((d): d is Date => d != null);
        if (lastWatchedDates.length > 0) {
          const maxDate = new Date(Math.max(...lastWatchedDates.map(d => d.getTime())));
          moduleCompletionDates.push(maxDate);
        }
      } else if (startedForModule) {
        inProgressCount += 1;
      }
    }

    const notStartedCount = totalModules - completedCount - inProgressCount;

    // Total learning time
    const totalSeconds = userProgressList.reduce((acc, p) => acc + p.currentPosition, 0);
    const learningTime = formatLearningTime(totalSeconds);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    startOfWeek.setHours(0, 0, 0, 0);
    const thisWeekSeconds = userProgressList
      .filter(p => p.lastWatchedAt >= startOfWeek)
      .reduce((acc, p) => acc + p.currentPosition, 0);
    const learningTimeTrend =
      thisWeekSeconds > 0
        ? `+${formatLearningTime(thisWeekSeconds)} cette semaine`
        : '+0m cette semaine';

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const modulesCompletedThisMonth = moduleCompletionDates.filter(d => d >= startOfMonth).length;
    const modulesCompletedTrend =
      modulesCompletedThisMonth > 0 ? `+${modulesCompletedThisMonth} ce mois` : '+0 ce mois';

    const globalProgress =
      totalModules > 0
        ? Math.round((completedCount / totalModules) * 100)
        : (beneficiary?.progressPercent ?? 0);
    const previousMonthProgress =
      totalModules > 0 && modulesCompletedThisMonth >= 0
        ? Math.round(((completedCount - modulesCompletedThisMonth) / totalModules) * 100)
        : globalProgress;
    const globalProgressTrend =
      globalProgress > previousMonthProgress
        ? `+${globalProgress - previousMonthProgress}% ce mois`
        : '+0% ce mois';

    // Videos watched trend
    const videosCompletedThisWeek = userProgressList.filter(
      p => p.isCompleted && p.lastWatchedAt >= startOfWeek
    ).length;
    const videosWatchedTrend =
      videosCompletedThisWeek > 0
        ? `+${videosCompletedThisWeek} cette semaine`
        : '+0 cette semaine';

    // Calculate average session time
    const averageSessionTime = this.calculateAverageSessionTime(userProgressList);

    // Calculate learning streak
    const learningStreakDays = this.calculateLearningStreak(userProgressList);

    // Monthly progress with enhanced data
    const monthlyProgress = this.buildMonthlyProgress(userProgressList);

    // Recent activity
    const recentActivity = this.buildRecentActivity(userProgressList, mediaIdToChapterMap);

    // Time by module (top 5)
    const timeByModule = Array.from(timeByModuleMap.values())
      .sort((a, b) => b.totalSeconds - a.totalSeconds)
      .slice(0, 5)
      .map(m => ({
        moduleId: m.moduleId,
        moduleTitle: m.moduleTitle,
        totalSeconds: m.totalSeconds,
        completionPercent:
          m.totalMedias > 0 ? Math.round((m.completedMedias / m.totalMedias) * 100) : 0,
      }));

    const quizzesPassed = 0;
    const totalQuizzes = 0;
    const quizzesPassedTrend =
      totalQuizzes > 0
        ? `${Math.round((quizzesPassed / totalQuizzes) * 100)}% de réussite`
        : '0% de réussite';

    return {
      stats: {
        modulesCompleted: { current: completedCount, total: totalModules },
        learningTime,
        quizzesPassed: { current: quizzesPassed, total: totalQuizzes },
        globalProgress,
        modulesCompletedTrend,
        learningTimeTrend,
        globalProgressTrend,
        quizzesPassedTrend,
        videosWatched: { current: completedVideos, total: totalVideos },
        videosWatchedTrend,
        averageSessionTime,
        learningStreakDays,
      },
      moduleStats: {
        completed: completedCount,
        inProgress: inProgressCount,
        notStarted: notStartedCount,
        total: totalModules,
      },
      monthlyProgress,
      recentActivity,
      timeByModule,
    };
  }

  private calculateAverageSessionTime(
    userProgressList: Array<{ currentPosition: number; lastWatchedAt: Date }>
  ): string {
    if (userProgressList.length === 0) return '0m';

    // Group by day to estimate sessions
    const sessionsByDay = new Map<string, number>();
    for (const progress of userProgressList) {
      const dayKey = progress.lastWatchedAt.toISOString().split('T')[0];
      const current = sessionsByDay.get(dayKey) ?? 0;
      sessionsByDay.set(dayKey, current + progress.currentPosition);
    }

    if (sessionsByDay.size === 0) return '0m';

    const totalSeconds = Array.from(sessionsByDay.values()).reduce((acc, val) => acc + val, 0);
    const avgSeconds = Math.round(totalSeconds / sessionsByDay.size);
    return formatLearningTime(avgSeconds);
  }

  private calculateLearningStreak(userProgressList: Array<{ lastWatchedAt: Date }>): number {
    if (userProgressList.length === 0) return 0;

    // Get unique days with activity
    const activityDays = new Set(
      userProgressList.map(p => p.lastWatchedAt.toISOString().split('T')[0])
    );
    const sortedDays = Array.from(activityDays).sort((a, b) => b.localeCompare(a));

    if (sortedDays.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Streak must include today or yesterday
    if (sortedDays[0] !== todayStr && sortedDays[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    let currentDate = new Date(sortedDays[0]);

    for (let i = 1; i < sortedDays.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const expectedPrevDay = prevDate.toISOString().split('T')[0];

      if (sortedDays[i] === expectedPrevDay) {
        streak += 1;
        currentDate = new Date(sortedDays[i]);
      } else {
        break;
      }
    }

    return streak;
  }

  private buildMonthlyProgress(
    userProgressList: Array<{ isCompleted: boolean; lastWatchedAt: Date; currentPosition: number }>
  ): Array<{ month: string; progress: number; totalMinutes: number; sessions: number }> {
    const now = new Date();
    const result: Array<{
      month: string;
      progress: number;
      totalMinutes: number;
      sessions: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthProgress = userProgressList.filter(
        p => p.lastWatchedAt >= monthStart && p.lastWatchedAt <= monthEnd
      );

      const count = monthProgress.filter(p => p.isCompleted).length;
      const totalSeconds = monthProgress.reduce((acc, p) => acc + p.currentPosition, 0);
      const totalMinutes = Math.round(totalSeconds / 60);

      // Estimate sessions by unique days in month
      const uniqueDays = new Set(
        monthProgress.map(p => p.lastWatchedAt.toISOString().split('T')[0])
      );
      const sessions = uniqueDays.size;

      result.push({
        month: MONTH_LABELS[d.getMonth()],
        progress: count,
        totalMinutes,
        sessions,
      });
    }

    return result;
  }

  private buildRecentActivity(
    userProgressList: Array<{
      mediaId: string;
      completionRate: number;
      lastWatchedAt: Date;
      duration: number;
      currentPosition: number;
    }>,
    mediaIdToChapterMap: Map<
      string,
      { chapterId: string; chapterTitle: string; lessonTitle: string; moduleTitle: string }
    >
  ): Array<{
    chapterId: string;
    chapterTitle: string;
    lessonTitle: string;
    moduleTitle: string;
    progress: number;
    lastWatchedAt: Date;
    remainingTime: string;
  }> {
    const sorted = [...userProgressList]
      .sort((a, b) => b.lastWatchedAt.getTime() - a.lastWatchedAt.getTime())
      .slice(0, 5);

    return sorted
      .map(p => {
        const chapterInfo = mediaIdToChapterMap.get(p.mediaId);
        if (!chapterInfo) return null;

        const remainingSeconds = Math.max(0, p.duration - p.currentPosition);
        const remainingTime = formatLearningTime(remainingSeconds);

        return {
          chapterId: chapterInfo.chapterId,
          chapterTitle: chapterInfo.chapterTitle,
          lessonTitle: chapterInfo.lessonTitle,
          moduleTitle: chapterInfo.moduleTitle,
          progress: Math.round(p.completionRate),
          lastWatchedAt: p.lastWatchedAt,
          remainingTime,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }
}
