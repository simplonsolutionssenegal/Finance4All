// components/admin/modules/stats-cards.tsx
import { BookOpen, FileText, HelpCircle, Users } from 'lucide-react';

interface StatsCardsProps {
  totalModules: number;
  publishedModules: number;
  totalLessons?: number;
  totalQuizzes: number;
  totalLearners: number;
  completionRate?: number;
}

export default function StatsCards({
  totalModules,
  publishedModules,
  totalLessons = 0,
  totalQuizzes,
  totalLearners,
  completionRate = 0,
}: StatsCardsProps) {
  const drafts = Math.max(0, totalModules - publishedModules);

  const stats = [
    {
      title: 'Modules',
      value: totalModules,
      subtitle: `${drafts} brouillon${drafts > 1 ? 's' : ''}`,
      badge: `${publishedModules} publiés`,
      Icon: BookOpen,
      cardBg: 'bg-gradient-to-b from-slate-50 to-white',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
    },
    {
      title: 'Leçons',
      value: totalLessons,
      subtitle:
        totalModules > 0
          ? `~${Math.round(totalLessons / totalModules)} par module`
          : '~0 par module',
      badge: 'Structure',
      Icon: FileText,
      cardBg: 'bg-gradient-to-b from-emerald-50/70 to-white',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
    },
    {
      title: 'Quiz',
      value: totalQuizzes,
      subtitle: 'Modules + leçons',
      badge: 'Évaluations',
      Icon: HelpCircle,
      cardBg: 'bg-gradient-to-b from-orange-50/70 to-white',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-orange-700',
    },
    {
      title: 'Apprenants',
      value: totalLearners,
      subtitle: 'Inscrits actifs',
      badge: `${completionRate}% taux`,
      Icon: Users,
      cardBg: 'bg-gradient-to-b from-purple-50/70 to-white',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-700',
    },
  ];

  return (
    <div className='mb-6 space-y-4'>
      {/* Barre de titre (comme sur l’image) */}
      <div className='flex items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-sky-50 px-5 py-4 '>
        <div className='h-9 w-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center'>
          <BookOpen className='h-5 w-5 text-slate-700 bg-primary' />
        </div>
        <h2 className='text-base md:text-lg font-semibold text-slate-800'>
          Gestion des Contenus d&apos;Apprentissage
        </h2>
      </div>

      {/* Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
        {stats.map(
          ({
            title,
            value,
            subtitle,
            badge,
            Icon,
            cardBg,
            iconBg,
            iconColor,
            badgeBg,
            badgeText,
          }) => (
            <div
              key={title}
              className={[
                'rounded-2xl border border-slate-100 p-5',
                'shadow-[0_10px_18px_-14px_rgba(0,0,0,0.25)]',
                cardBg,
              ].join(' ')}
            >
              <div className='flex items-start justify-between'>
                <div className={`h-10 w-10 rounded-2xl ${iconBg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>

                <span
                  className={[
                    'px-3 py-1 rounded-full text-[11px] font-medium border',
                    'border-white/60 shadow-sm',
                    badgeBg,
                    badgeText,
                  ].join(' ')}
                >
                  {badge}
                </span>
              </div>

              <div className='mt-5'>
                <p className='text-sm text-slate-600'>{title}</p>
                <p className='mt-1 text-3xl font-semibold tracking-tight text-slate-900'>
                  {Number(value).toLocaleString('fr-FR')}
                </p>
                <p className='mt-1 text-xs text-slate-500'>{subtitle}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
