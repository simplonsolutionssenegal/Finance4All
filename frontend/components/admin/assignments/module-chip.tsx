'use client';

import { Check } from 'lucide-react';
import Image from 'next/image';

import type { ModuleWithAssignment } from '@/types/modules/assignments';

export default function ModuleChip({
  module,
  selected,
  mode,
  onToggle,
}: {
  module: ModuleWithAssignment;
  selected: boolean;
  mode: 'assign' | 'remove';
  onToggle: () => void;
}) {
  const isCompleted = module.assignmentStatus === 'COMPLETED';
  const isAssigned = module.assigned;

  const isDanger = mode === 'remove' && isAssigned;

  return (
    <button
      type='button'
      onClick={onToggle}
      className={[
        'w-full text-left rounded-xl border px-3 py-2 transition-colors',
        selected
          ? isDanger
            ? 'border-red-400 bg-red-50'
            : 'border-sky-400 bg-sky-50'
          : 'border-gray-200 bg-white hover:bg-gray-50',
        isAssigned ? 'cursor-pointer' : '',
      ].join(' ')}
    >
      <div className='flex items-center gap-3'>
        <div className='h-8 w-8 rounded-lg bg-gray-100 overflow-hidden relative shrink-0'>
          {module.imageUrl ? (
            <Image src={module.imageUrl} alt={module.title} fill className='object-cover' />
          ) : null}
        </div>

        <div className='min-w-0 flex-1'>
          <p className='text-sm font-medium text-gray-800 truncate'>{module.title}</p>
          <p className='text-[11px] text-gray-500'>{module.difficultyLevel}</p>
        </div>

        {isCompleted ? (
          <span className='inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-700'>
            <Check size={14} /> Complété
          </span>
        ) : isAssigned ? (
          <span
            className={[
              'text-xs px-2 py-1 rounded-full',
              mode === 'remove' && selected
                ? 'bg-red-100 text-red-700'
                : 'bg-orange-100 text-orange-700',
            ].join(' ')}
          >
            Assigné
          </span>
        ) : null}
      </div>
    </button>
  );
}
