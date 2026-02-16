'use client';

import { BookOpen, Clock, Lock, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { useMediaUrl } from '@/hooks/module/media/useMedia';
import { cn } from '@/lib/utils';
import { type LearningModule, UserModuleStatus } from '@/types/learning-module';
import { DifficultyLevel } from '@/types/modules/module';

interface ModuleCardProps {
  module: LearningModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const isLocked = module.userStatus === UserModuleStatus.LOCKED;
  const isCompleted = module.userStatus === UserModuleStatus.COMPLETED;
  const isInProgress = module.userStatus === UserModuleStatus.IN_PROGRESS;
  const { url: imageUrl } = useMediaUrl(module.imageMediaId);

  return (
    <div
      className={cn(
        'group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md',
        isLocked && 'opacity-90'
      )}
    >
      {/* Image Container */}
      <div className='relative h-48 cursor-pointer w-full overflow-hidden'>
        {imageUrl && (
          <Link href={`/learning/${module.id}`}>
            <Image
              src={imageUrl}
              alt={module.title}
              fill
              className={cn(
                'object-cover transition-transform duration-500 group-hover:scale-105',
                isLocked && 'grayscale-[0.5]'
              )}
            />
          </Link>
        )}

        {/* Difficulty Badge */}
        <div className='absolute top-4 left-4'>
          <Badge
            className={cn(
              'px-3 py-1 text-[10px] font-semibold uppercase tracking-wider border-none',
              module.difficultyLevel === DifficultyLevel.BEGINNER
                ? 'bg-green-500/30 text-green-800'
                : 'bg-orange-500/30 text-orange-800'
            )}
          >
            {module.difficultyLevel === DifficultyLevel.BEGINNER ? 'Débutant' : 'Intermédiaire'}
          </Badge>
        </div>

        {/* Status Overlay */}
        <div className='absolute top-4 right-4'>
          {isCompleted && (
            <div className='bg-green-500 text-white p-1.5 rounded-full shadow-lg'>
              <CheckCircle2 size={18} />
            </div>
          )}
          {isLocked && (
            <div className='bg-gray-900/50 text-white p-1.5 rounded-lg backdrop-blur-sm'>
              <Lock size={18} />
            </div>
          )}
          {isInProgress && (
            <div className='bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg'>
              {module.progressPercent}%
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='flex flex-col flex-1 p-6'>
        <h3 className='text-lg font-medium text-gray-700 mb-2 group-hover:text-primary transition-colors'>
          {module.title}
        </h3>
        <p className='text-sm text-gray-500 line-clamp-2 mb-6'>{module.description}</p>

        {/* Progress Section */}
        {!isLocked && (
          <div className='w-full mb-6'>
            <div className='flex justify-between items-center mb-2'>
              <span className='text-sm font-medium text-slate-500'>Progression</span>
              <span className='text-sm font-medium text-slate-500'>{module.progressPercent}%</span>
            </div>

            <div className='w-full bg-slate-100 rounded-full h-1.5 overflow-hidden'>
              <div
                className='bg-primary-200 h-full rounded-full transition-all duration-300'
                style={{ width: `${module.progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Meta Info */}
        <div className='flex items-center justify-between gap-6 mt-auto'>
          <div className='flex items-center gap-2 text-gray-400'>
            <BookOpen size={16} className='text-[#81e6f0]' />
            <span className='text-xs font-semibold'>{module.lessonCount} leçons</span>
          </div>
          <div className='flex items-center gap-2 text-gray-400'>
            <Clock size={16} className='text-gray-500' />
            <span className='text-xs font-semibold text-gray-500'>
              {module.estimatedDuration} min
            </span>
          </div>
        </div>

        {/* Thematic Badge */}
        {module.thematic && (
          <div className='mt-6 pt-6 border-t border-gray-200'>
            <Badge
              variant='secondary'
              className='bg-gray-50 text-gray-500 hover:bg-gray-100 border-none font-medium px-4 py-1'
            >
              {module.thematic}
            </Badge>
          </div>
        )}

        {/* Locked Message */}
        {isLocked && (
          <div className='mt-6 pt-6 border-t border-gray-200 flex items-start gap-2'>
            <Lock size={14} className='text-gray-300 mt-0.5' />
            <p className='text-[11px] text-gray-400 leading-tight'>
              Terminez les modules précédents pour débloquer
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
