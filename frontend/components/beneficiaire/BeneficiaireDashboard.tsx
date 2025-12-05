// frontend/components/beneficiaire/BeneficiaireDashboard.tsx

'use client';

import { useUser } from '@clerk/nextjs';
import { BookOpen, Clock, Award, TrendingUp } from 'lucide-react';

import {
  StatCard,
  DonutChart,
  MonthlyProgressLineChart,
} from '@/components/beneficiaire/ChartComponents';

interface BeneficiaireDashboardProps {
  userId?: string;
}

export default function BeneficiaireDashboard({ userId: _userId }: BeneficiaireDashboardProps) {
  // Récupérer les données de l'utilisateur connecté avec Clerk
  const { user, isLoaded } = useUser();

  // Nom complet de l'utilisateur
  const fullName = user?.fullName || 'Bénéficiaire';
  // Données du dashboard bénéficiaire (statique pour l'exemple)
  const stats = {
    modulesCompleted: { current: 8, total: 26 },
    learningTime: '24h 30m',
    quizzesPassed: { current: 12, total: 15 },
    globalProgress: 75,
  };

  // Données pour la répartition des modules
  const moduleDistributionData = [
    { name: 'Complétés', value: 8, color: '#10b981' },
    { name: 'En cours', value: 5, color: '#3b82f6' },
    { name: 'Non commencés', value: 13, color: '#d1d5db' },
  ];

  // Données pour le graphique de progression mensuelle
  const monthlyProgressData = [
    { month: 'Janv', progress: 20 },
    { month: 'Fev', progress: 25 },
    { month: 'Mar', progress: 30 },
    { month: 'Avr', progress: 35 },
    { month: 'Mai', progress: 40 },
    { month: 'Juin', progress: 45 },
    { month: 'Juil', progress: 60 },
    { month: 'Aout', progress: 75 },
    { month: 'Sept', progress: 80 },
    { month: 'Oct', progress: 85 },
    { month: 'Nov', progress: 90 },
    { month: 'Déc', progress: 100 },
  ];

  // État de chargement
  if (!isLoaded) {
    return (
      <div className='min-h-screen bg-gray-50 p-8 flex items-center justify-center'>
        <p className='text-gray-600'>Chargement...</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>Bonjour {fullName} 👋</h1>
        <p className='text-gray-600 mt-1'>Suivez votre progression et vos formations</p>
      </div>

      {/* Stats Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <StatCard
          icon={<BookOpen className='w-6 h-6' />}
          value={`${stats.modulesCompleted.current}/${stats.modulesCompleted.total}`}
          label='Modules complétés'
          trend='+2 ce mois'
          trendUp
          iconBgColor='bg-emerald-50'
          iconColor='text-emerald-600'
          progress={(8 / 26) * 100}
          progressColor='bg-emerald-500'
        />

        <StatCard
          icon={<Clock className='w-6 h-6' />}
          value={stats.learningTime}
          label="Temps d'apprentissage"
          trend='+5h cette semaine'
          iconBgColor='bg-blue-50'
          iconColor='text-blue-600'
        />

        <StatCard
          icon={<Award className='w-6 h-6' />}
          value={`${stats.quizzesPassed.current}/${stats.quizzesPassed.total}`}
          label='Quiz réussis'
          trend='80% de réussite'
          iconBgColor='bg-purple-50'
          iconColor='text-purple-600'
          progress={(12 / 15) * 100}
          progressColor='bg-green-500'
        />
        <StatCard
          icon={<TrendingUp className='w-6 h-6' />}
          value={`${stats.globalProgress}%`}
          label='Progression globale'
          trend='+15% ce mois'
          trendUp
          iconBgColor='bg-sky-50'
          iconColor='text-sky-600'
          progress={75}
          progressColor='bg-sky-500'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
        <MonthlyProgressLineChart
          data={monthlyProgressData.map(item => ({ month: item.month, value: item.progress }))}
          title='Progression mensuelle'
          subtitle='Évolution de votre apprentissage'
        />
        <DonutChart
          title='Répartition des modules'
          subtitle='26 modules au total'
          data={moduleDistributionData}
        />
      </div>
    </div>
  );
}
