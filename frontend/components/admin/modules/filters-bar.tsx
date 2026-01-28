// frontend/src/components/admin/modules/filters-bar.tsx
'use client';

import { Plus } from 'lucide-react';

interface FiltersBarProps {
  onNewClick: () => void;
  title?: string;
  primaryText?: string;
  secondaryText?: string;
}

export default function FiltersBar({
  onNewClick,
  title = 'Actions rapides',
  primaryText = 'Créer un module',
  secondaryText = 'Nouveau parcours d’apprentissage',
}: FiltersBarProps) {
  return (
    <div className='space-y-3 mb-2'>
      <div className='text-xl font-SemiBold'>{title}</div>

      <button
        type='button'
        onClick={onNewClick}
        className='w-full md:w-[300px] flex items-center gap-4 p-4 rounded-xl border border-blue-200 bg-white hover:bg-blue-50/40 transition-colors'
      >
        <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600'>
          <Plus size={18} />
        </span>

        <span className='text-left'>
          <span className='block text-sm font-semibold '>{primaryText}</span>
          <span className='block text-sm font-regular'>{secondaryText}</span>
        </span>
      </button>
    </div>
  );
}
