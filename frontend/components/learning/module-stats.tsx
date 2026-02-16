'use client';

import { BookOpen, CheckCircle2, PlayCircle, Lock } from 'lucide-react';

import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  iconClassName: string;
  bgClassName: string;
}

function StatCard({ icon: Icon, label, value, iconClassName, bgClassName }: StatCardProps) {
  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4 shadow-sm flex-1 min-w-[200px]'>
      <div className={cn('p-3 rounded-xl', bgClassName)}>
        <Icon className={cn('w-6 h-6', iconClassName)} />
      </div>
      <div>
        <p className='text-xs font-medium text-gray-400 mb-0.5'>{label}</p>
        <p className='text-xl font-bold text-[#142a40]'>{value}</p>
      </div>
    </div>
  );
}

interface ModuleStatsProps {
  total: number;
  completed: number;
  inProgress: number;
  locked: number;
}

export function ModuleStats({ total, completed, inProgress, locked }: ModuleStatsProps) {
  return (
    <div className='flex flex-wrap gap-4 mb-6'>
      <StatCard
        icon={BookOpen}
        label='Total'
        value={total}
        bgClassName='bg-blue-50 shadow-lg'
        iconClassName='text-blue-500'
      />
      <StatCard
        icon={CheckCircle2}
        label='Terminés'
        value={completed}
        bgClassName='bg-green-500 shadow-lg'
        iconClassName='text-white'
      />
      <StatCard
        icon={PlayCircle}
        label='En cours'
        value={inProgress}
        bgClassName='bg-yellow-50 shadow-lg'
        iconClassName='text-yellow-500'
      />
      <StatCard
        icon={Lock}
        label='Verrouillés'
        value={locked}
        bgClassName='bg-gray-50 shadow-lg'
        iconClassName='text-gray-500'
      />
    </div>
  );
}
