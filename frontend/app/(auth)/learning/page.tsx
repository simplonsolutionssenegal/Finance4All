'use client';

import { BookOpen } from 'lucide-react';
import { useState } from 'react';

import { ModuleCard } from '@/components/learning/module-card';
import { ModuleFilters, type FilterType } from '@/components/learning/module-filters';
import { ModuleStats } from '@/components/learning/module-stats';
import { Skeleton } from '@/components/ui/skeleton';
import { useModulesWithProgress } from '@/hooks/learning/useModulesWithProgress';
import { useGetLearningModules } from '@/hooks/module/useGetLearningModules';
import { UserModuleStatus } from '@/types/learning-module';

export default function LearningPage() {
  const { modules, isLoading: modulesLoading } = useGetLearningModules();
  const { enrichedModules, isLoading: progressLoading } = useModulesWithProgress(modules);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

  const isLoading = modulesLoading || progressLoading;

  const counts = {
    all: enrichedModules.length,
    available: enrichedModules.filter(m => m.userStatus !== UserModuleStatus.LOCKED).length,
    inProgress: enrichedModules.filter(m => m.userStatus === UserModuleStatus.IN_PROGRESS).length,
    completed: enrichedModules.filter(m => m.userStatus === UserModuleStatus.COMPLETED).length,
    locked: enrichedModules.filter(m => m.userStatus === UserModuleStatus.LOCKED).length,
  };

  const filteredModules = enrichedModules.filter(module => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'AVAILABLE') return module.userStatus !== UserModuleStatus.LOCKED;
    if (activeFilter === 'IN_PROGRESS') return module.userStatus === UserModuleStatus.IN_PROGRESS;
    if (activeFilter === 'COMPLETED') return module.userStatus === UserModuleStatus.COMPLETED;
    return true;
  });

  return (
    <div className='container mx-auto px-6 py-12 max-w-7xl'>
      {/* Header Section */}
      <div className='mb-4'>
        <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-200/20 text-primary-300 mb-6'>
          <BookOpen size={14} />
          <span className='text-[10px] font-bold uppercase tracking-wider'>
            Plateforme d&apos;apprentissage
          </span>
        </div>

        <h1 className='text-5xl font-medium text-gray-700 mb-4'>Modules de Formation</h1>
        <p className='text-lg text-gray-500 max-w-2xl leading-relaxed'>
          Développez vos compétences financières à votre rythme avec nos modules interactifs
        </p>
      </div>

      {/* Stats Section */}
      <ModuleStats
        total={counts.all}
        completed={counts.completed}
        inProgress={counts.inProgress}
        locked={counts.locked}
      />

      {/* Filters Section */}
      <ModuleFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} counts={counts} />

      {/* Modules Grid */}
      {isLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {[1, 2, 3].map(i => (
            <div key={i} className='space-y-4'>
              <Skeleton className='h-48 w-full rounded-3xl' />
              <Skeleton className='h-6 w-3/4' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-1/2' />
            </div>
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filteredModules.map(module => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      )}
    </div>
  );
}
