//components/admin/modules/stats-cards.tsx

import { BookOpen, GraduationCap, CheckSquare, Users } from 'lucide-react';

interface StatsCardsProps {
  totalModules: number;
  publishedModules: number;
  totalQuizzes: number;
  totalLearners: number;
}

export default function StatsCards({
  totalModules,
  publishedModules,
  totalQuizzes,
  totalLearners,
}: StatsCardsProps) {
  const stats = [
    {
      icon: BookOpen,
      value: totalModules,
      label: 'Modules',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: GraduationCap,
      value: publishedModules,
      label: 'Publiés',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: CheckSquare,
      value: totalQuizzes,
      label: 'Quiz',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      icon: Users,
      value: totalLearners,
      label: 'Apprenants',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className='mb-8'>
      {/* En-tête */}
      <div className='mb-6'>
        <h1 className='text-4xl font-bold text-gray-900 mb-2'>Gestion des contenus</h1>
        <p className='text-gray-500'>Créez et gérez les modules et quiz de la plateforme</p>
      </div>

      {/* Cards statistiques */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow'
            >
              {/* Icône */}
              <div
                className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center mb-4`}
              >
                <Icon className={`${stat.iconColor} w-6 h-6`} />
              </div>

              {/* Valeur */}
              <p className='text-4xl font-bold text-gray-900 mb-2'>{stat.value}</p>

              {/* Label */}
              <p className='text-sm text-gray-500'>{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
