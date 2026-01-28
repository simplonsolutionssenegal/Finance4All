'use client';

import { cn } from '@/lib/utils';

export type FilterType = 'ALL' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';

interface ModuleFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    available: number;
    inProgress: number;
    completed: number;
  };
}

export function ModuleFilters({ activeFilter, onFilterChange, counts }: ModuleFiltersProps) {
  const filters: { type: FilterType; label: string; count: number }[] = [
    { type: 'ALL', label: 'Tous', count: counts.all },
    { type: 'AVAILABLE', label: 'Disponibles', count: counts.available },
    { type: 'IN_PROGRESS', label: 'En cours', count: counts.inProgress },
    { type: 'COMPLETED', label: 'Terminés', count: counts.completed },
  ];

  return (
    <div className='flex flex-wrap gap-3 mb-8'>
      {filters.map(filter => (
        <button
          key={filter.type}
          onClick={() => onFilterChange(filter.type)}
          className={cn(
            'px-4 py-2 rounded-xl text-xs cursor-pointer font-semibold transition-all duration-200',
            activeFilter === filter.type
              ? 'bg-primary-300 text-white shadow-sm'
              : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-200'
          )}
        >
          {filter.label} ({filter.count})
        </button>
      ))}
    </div>
  );
}
