'use client';

import { Clock, Users, Target, ArrowRight, Image as ImageIcon, Sparkle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMediaUrl } from '@/hooks/module/media/useMedia';
import type { LearningModule } from '@/types/learning-module';
import { DifficultyLevel } from '@/types/modules/module';

export function ModuleCardClient({
  module,
}: {
  module: LearningModule & { durationStr?: string; inscrits?: number; reussite?: number };
}) {
  const { url: imageUrl } = useMediaUrl(module.imageMediaId);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case DifficultyLevel.BEGINNER:
        return 'bg-amber-300/10 text-amber-500 border-amber-500/40';
      case DifficultyLevel.INTERMEDIATE:
        return 'bg-blue-300/10 text-blue-500 border-blue-500/40';
      case DifficultyLevel.ADVANCED:
        return 'bg-green-300/10 text-green-500 border-green-500/40';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case DifficultyLevel.BEGINNER:
        return 'Débutant';
      case DifficultyLevel.INTERMEDIATE:
        return 'Intermédiaire';
      case DifficultyLevel.ADVANCED:
        return 'Avancé';
      default:
        return 'Tous niveaux';
    }
  };

  return (
    <div className='bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col h-full group'>
      <div className='relative h-48 bg-slate-100 w-full overflow-hidden'>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={module.title}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-500'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-slate-200 text-slate-400'>
            <ImageIcon className='w-12 h-12 opacity-50' />
          </div>
        )}

        <div className='absolute top-4 left-4 right-4 flex justify-between items-start'>
          <div className='flex items-center gap-2'>
            <span className='flex items-center text-slate-600 gap-1.5 px-2 py-0.5 bg-white/80 rounded-full'>
              <Sparkle className='w-4 h-4 rounded-full' />
              {module.thematic || 'Finance'}
            </span>
          </div>
          <Badge
            className={`${getDifficultyColor(module.difficultyLevel)} backdrop-blur-sm border font-medium px-2.5 py-1 rounded-full`}
          >
            {getDifficultyLabel(module.difficultyLevel)}
          </Badge>
        </div>

        <div className='absolute bottom-4 left-4 flex gap-2'>
          <Badge
            variant='secondary'
            className='bg-black/60 hover:bg-black/70 text-white border-none py-1'
          >
            <Clock className='w-3.5 h-3.5 mr-1.5' />
            <span className='text-xs font-normal'>
              {module.durationStr || `${module.estimatedDuration} heures`}
            </span>
          </Badge>
        </div>
      </div>

      <div className='p-6 flex flex-col flex-1'>
        <h3 className='text-xl font-bold text-slate-800 mb-2 line-clamp-2'>{module.title}</h3>
        <p className='text-slate-500 text-sm mb-6 flex-1 line-clamp-3'>{module.description}</p>

        <div className='flex items-center justify-between gap-2 py-4 border-t border-slate-100 mb-4'>
          <div className='flex flex-col border border-slate-200 bg-white rounded-xl p-2 w-full'>
            <span className='text-xs text-slate-400 mb-1 flex items-center gap-1.5'>
              <Users className='w-3.5 h-3.5' /> Inscrits
            </span>
            <span className='font-semibold text-slate-700'>{module.inscrits || '0'}</span>
          </div>
          <div className='w-px h-8 bg-slate-100' />
          <div className='flex flex-col border border-primary-200 bg-primary-100/20 rounded-xl p-2 w-full'>
            <span className='text-xs text-slate-400 mb-1 flex items-center gap-1.5'>
              <Target className='w-3.5 h-3.5' /> Taux de réussite
            </span>
            <span className='font-semibold text-primary-300'>{module.reussite || '0'}%</span>
          </div>
        </div>

        <Link href={`/register`} className='w-full'>
          <Button className='w-full bg-primary-300 hover:bg-primary-400 rounded-full cursor-pointer text-white border-none flex items-center justify-center gap-2 group-hover:bg-primary-300 group-hover:text-white transition-colors duration-300 shadow-none'>
            Commencer maintenant
            <ArrowRight className='w-4 h-4' />
          </Button>
        </Link>
      </div>
    </div>
  );
}
