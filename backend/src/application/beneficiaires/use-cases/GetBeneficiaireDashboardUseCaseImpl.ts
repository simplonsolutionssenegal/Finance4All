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

    let completedCount = 0;
    let inProgressCount = 0;
    const moduleCompletionDates: Date[] = [];

    for (const module of publishedModules) {
      const mediaIds: string[] = [];
      for (const lesson of module.lessons) {
        for (const chapter of lesson.chapters) {
          if (chapter.mediaId) mediaIds.push(chapter.mediaId);
        }
      }

      if (mediaIds.length === 0) {
        inProgressCount += 0;
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

    const monthlyProgress = this.buildMonthlyProgress(userProgressList);

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
      },
      moduleStats: {
        completed: completedCount,
        inProgress: inProgressCount,
        notStarted: notStartedCount,
        total: totalModules,
      },
      monthlyProgress,
    };
  }

  private buildMonthlyProgress(
    userProgressList: Array<{ isCompleted: boolean; lastWatchedAt: Date }>
  ): Array<{ month: string; progress: number }> {
    const now = new Date();
    const result: Array<{ month: string; progress: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

      const count = userProgressList.filter(
        p => p.isCompleted && p.lastWatchedAt >= monthStart && p.lastWatchedAt <= monthEnd
      ).length;

      result.push({
        month: MONTH_LABELS[d.getMonth()],
        progress: count,
      });
    }

    return result;
  }
}
