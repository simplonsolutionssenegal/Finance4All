'use client';

import { useUser } from '@clerk/nextjs';
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';

import { useBeneficiaireDashboardData } from '@/hooks/beneficiary/useBeneficiaireDashboardData';

import { StatCard, DonutChart, MonthlyProgressLineChart } from './ChartComponents';

interface BeneficiaireDashboardProps {
  userId?: string;
}

export default function BeneficiaireDashboard({ userId }: BeneficiaireDashboardProps) {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { data, isLoading, error, isLoaded, refetch, resetError } = useBeneficiaireDashboardData(
    userId ?? undefined
  );

  if (!clerkLoaded) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='animate-pulse text-gray-500 font-medium'>
          Chargement du tableau de bord...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6'>
        <p className='text-red-600 font-medium'>{error}</p>
        <button
          type='button'
          onClick={() => {
            resetError();
            refetch();
          }}
          className='mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800'
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (isLoading || !isLoaded || !data) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='animate-pulse text-gray-500 font-medium'>
          Chargement des statistiques...
        </div>
      </div>
    );
  }

  const { stats, moduleStats, monthlyProgress } = data;
  const { modulesCompleted, learningTime, quizzesPassed, globalProgress } = stats;

  const statsData = [
    {
      label: 'Modules complétés',
      value: `${modulesCompleted.current}/${modulesCompleted.total}`,
      icon: <BookOpen className='w-6 h-6' />,
      trend: stats.modulesCompletedTrend ?? '+0 ce mois',
      trendVariant: 'green' as const,
      progress:
        modulesCompleted.total > 0 ? (modulesCompleted.current / modulesCompleted.total) * 100 : 0,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      barColor: 'bg-emerald-500',
    },
    {
      label: "Temps d'apprentissage",
      value: learningTime,
      icon: <Clock className='w-6 h-6' />,
      trend: stats.learningTimeTrend ?? '+0m cette semaine',
      trendVariant: 'green' as const,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      showProgress: false,
    },
    {
      label: 'Quiz réussis',
      value: `${quizzesPassed.current}/${quizzesPassed.total}`,
      icon: <Award className='w-6 h-6' />,
      trend:
        stats.quizzesPassedTrend ??
        (quizzesPassed.total > 0
          ? `${Math.round((quizzesPassed.current / quizzesPassed.total) * 100)}% de réussite`
          : '0% de réussite'),
      trendVariant: 'grey' as const,
      progress: quizzesPassed.total > 0 ? (quizzesPassed.current / quizzesPassed.total) * 100 : 0,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      barColor: 'bg-purple-500',
    },
    {
      label: 'Progression globale',
      value: `${globalProgress}%`,
      icon: <TrendingUp className='w-6 h-6' />,
      trend: stats.globalProgressTrend ?? '+0% ce mois',
      trendVariant: 'green' as const,
      progress: globalProgress,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      barColor: 'bg-sky-500',
    },
  ];

  const lineChartData = monthlyProgress?.map(d => ({ month: d.month, value: d.progress })) ?? [];
  const completed = moduleStats?.completed ?? 0;
  const inProgress = moduleStats?.inProgress ?? 0;
  const notStarted = moduleStats?.notStarted ?? 0;
  const donutData = [
    { name: 'Complétés', value: completed, color: '#2ECC71' },
    { name: 'En cours', value: inProgress, color: '#93C5FD' },
    { name: 'Non commencés', value: notStarted, color: '#E5E7EB' },
  ];

  return (
    <div className='min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8'>
      {/* Header */}
      <div className='mb-10'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight'>
          Bonjour, {userId ? (user?.firstName ?? 'Bénéficiaire') : 'Bénéficiaire'} 👋
        </h1>
        <p className='text-gray-500 mt-1'>Voici un résumé de votre activité et de vos progrès.</p>
      </div>

      {/* Stats Grid: 1 col sur mobile, 2 sur tablette, 4 sur desktop */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8'>
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
            trend={stat.trend}
            trendVariant={stat.trendVariant}
            progress={stat.progress}
            iconBgColor={stat.iconBg}
            iconColor={stat.iconColor}
            progressColor={stat.barColor}
            showProgress={stat.showProgress}
          />
        ))}
      </div>

      {/* Charts Grid: 1 col sur mobile/tablette, 2 sur desktop large */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <MonthlyProgressLineChart
          title='Progression mensuelle'
          subtitle='Évolution de votre apprentissage sur les 6 derniers mois'
          data={lineChartData}
        />
        <DonutChart
          title='Répartition des modules'
          subtitle='Aperçu global de votre catalogue'
          data={donutData}
        />
      </div>
    </div>
  );
}
