// frontend/src/components/admin/modules/filters-bar.tsx

'use client';

import { Search, Plus, X, Filter, ChevronDown } from 'lucide-react';

import { MODULE_STATUS_LABELS, THEMATIC_LABELS } from '@/lib/constants/module-constants';

interface FiltersBarProps {
  onNewClick: () => void;
  buttonLabel?: string;
  onSearchChange?: (search: string) => void;
  onStatusChange?: (status: string) => void;
  onThematicChange?: (thematic: string) => void;
  searchValue?: string;
  statusValue?: string;
  thematicValue?: string;
  totalResults?: number;
}

export default function FiltersBar({
  onNewClick,
  buttonLabel = 'Nouveau module',
  onSearchChange,
  onStatusChange,
  onThematicChange,
  searchValue = '',
  statusValue = '',
  thematicValue = '',
  totalResults = 0,
}: FiltersBarProps) {
  const hasActiveFilters = searchValue !== '' || statusValue !== '' || thematicValue !== '';

  return (
    <div className='space-y-3 mb-6'>
      <div className='flex flex-col md:flex-row gap-4 items-center'>
        {/* Recherche */}
        <div className='relative flex-1 w-full'>
          <Search
            className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400'
            size={20}
          />
          <input
            type='text'
            value={searchValue}
            placeholder='Rechercher un module...'
            onChange={e => onSearchChange?.(e.target.value)}
            className='w-full pl-12 pr-10 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all'
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange?.('')}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className='flex gap-3 w-full md:w-auto'>
          {/* Filtre par statut */}
          <div className='relative min-w-[180px]'>
            <Filter
              className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none z-10'
              size={16}
            />
            <select
              value={statusValue}
              onChange={e => onStatusChange?.(e.target.value)}
              className='w-full pl-11 pr-10 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer'
            >
              <option value=''>Tous les statuts</option>
              {Object.entries(MODULE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none'
              size={18}
            />
          </div>

          {/* Filtre par thématique */}
          <div className='relative min-w-[180px]'>
            <select
              value={thematicValue}
              onChange={e => onThematicChange?.(e.target.value)}
              className='w-full pl-4 pr-10 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer'
            >
              <option value=''>Toutes</option>
              {Object.entries(THEMATIC_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown
              className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none'
              size={18}
            />
          </div>

          {/* Bouton Nouveau */}
          <button
            onClick={onNewClick}
            className='flex items-center gap-2 px-6 py-3 bg-primary-300 text-white rounded-xl font-medium hover:bg-primary-400 transition-colors whitespace-nowrap'
          >
            <Plus size={20} />
            {buttonLabel}
          </button>
        </div>
      </div>

      {/* Indicateur de filtres actifs */}
      {hasActiveFilters && (
        <div className='flex items-center gap-2 text-sm'>
          <span className='text-gray-600'>
            {totalResults} résultat{totalResults > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => {
              onSearchChange?.('');
              onStatusChange?.('');
              onThematicChange?.('');
            }}
            className='text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1'
          >
            <X size={14} />
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
