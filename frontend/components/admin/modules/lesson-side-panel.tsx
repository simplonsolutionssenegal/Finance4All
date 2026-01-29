'use client';

import { X, Clock, Check } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateLesson } from '@/hooks/lesson/useCreateLesson';
import { LessonStatus } from '@/types/modules/Lesson';

type LessonSidePanelProps = {
  open: boolean;
  onClose: () => void;
  moduleId: string;
  nextOrder: number;
  onCreated?: () => void;
};

const STATUS_LABEL_FR: Record<LessonStatus, string> = {
  [LessonStatus.DRAFT]: 'Brouillon',
  [LessonStatus.PUBLISHED]: 'Publié',
  [LessonStatus.SCHEDULED]: 'Programmé',
  [LessonStatus.ARCHIVED]: 'Archivé',
};

export default function LessonSidePanel({
  open,
  onClose,
  moduleId,
  nextOrder,
  onCreated,
}: LessonSidePanelProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<LessonStatus>(LessonStatus.DRAFT);
  const [duration, setDuration] = useState<number | ''>('');

  const durationLabel = useMemo(() => `${Math.max(0, Number(duration) || 0)} min`, [duration]);

  const { createLesson, isCreating } = useCreateLesson({
    onSuccess: () => {
      onCreated?.();
      onClose();
    },
  });

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
    setStatus(LessonStatus.DRAFT);
    setDuration('');
  }, [open]);

  const canSubmit =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    duration !== '' &&
    Number.isFinite(Number(duration)) &&
    Number(duration) > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    createLesson({
      moduleId,
      payload: {
        title: title.trim(),
        description: description.trim(),
        duration: Number(duration),
        order: nextOrder,
        status,
      },
    });
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay mobile */}
      <div className='fixed inset-0 z-40 bg-black/20 md:hidden' onClick={onClose} />

      {/* Panel */}
      <aside className='fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-xl md:static md:z-auto md:w-auto md:max-w-none md:border md:rounded-2xl md:shadow-sm md:sticky md:top-4 md:h-[calc(100vh-2rem)] overflow-hidden'>
        <div className='h-full flex flex-col'>
          {/* Header */}
          <div className='px-6 pt-5 pb-4 border-b border-slate-200 bg-slate-50'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <p className='text-lg font-semibold text-slate-900'>Nouvelle leçon</p>
                <p className='mt-0.5 text-sm text-slate-600'>0 ressource • {durationLabel}</p>
              </div>

              <button
                onClick={onClose}
                className='h-9 w-9 rounded-lg hover:bg-white flex items-center justify-center'
                aria-label='Fermer'
                type='button'
              >
                <X className='h-4 w-4 text-slate-600' />
              </button>
            </div>
          </div>

          {/* Body scroll */}
          <div className='flex-1 overflow-y-auto px-6 py-5 space-y-6'>
            <div>
              <p className='text-sm font-semibold text-slate-800'>Informations générales</p>

              <div className='mt-4 space-y-4'>
                {/* Titre */}
                <div className='space-y-2'>
                  <Label className='text-slate-700'>
                    Titre de la leçon <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder='Ex: Introduction au budget familial'
                    className='bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
                  />
                </div>

                {/* Description */}
                <div className='space-y-2'>
                  <Label className='text-slate-700'>
                    Description <span className='text-red-500'>*</span>
                  </Label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder='Décrivez brièvement le contenu de cette leçon...'
                    className='min-h-[110px] bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
                  />
                </div>

                {/* Statut */}
                <div className='space-y-2'>
                  <Label className='text-slate-700'>Statut</Label>

                  <Select value={status} onValueChange={v => setStatus(v as LessonStatus)}>
                    <SelectTrigger className='bg-slate-50 border-slate-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'>
                      <SelectValue placeholder='Choisir un statut' />
                    </SelectTrigger>

                    <SelectContent className='bg-cyan-50 max-h-64 border border-cyan-200'>
                      {Object.values(LessonStatus).map(value => (
                        <SelectItem
                          key={value}
                          value={value}
                          className='group relative pl-3 pr-8 hover:bg-cyan-100 focus:bg-cyan-100 data-[state=checked]:bg-cyan-200 text-gray-900'
                        >
                          <span className='block truncate pr-2'>{STATUS_LABEL_FR[value]}</span>
                          <Check className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-600 opacity-0 group-data-[state=checked]:opacity-100 pointer-events-none flex-shrink-0' />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Durée */}
                <div className='space-y-2'>
                  <Label className='text-slate-700'>
                    Durée (minutes) <span className='text-red-500'>*</span>
                  </Label>

                  <div className='relative'>
                    <Input
                      type='number'
                      min={1}
                      value={duration}
                      onChange={e => {
                        const val = e.target.value;
                        setDuration(val === '' ? '' : Number(val));
                      }}
                      placeholder='Ex: 15'
                      className='bg-slate-50 border-slate-200 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary-400'
                    />
                    <Clock className='h-4 w-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2' />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='px-6 py-4 border-t border-slate-200 flex items-center justify-between'>
            <p className='text-sm text-slate-500 inline-flex items-center gap-2'>
              <Clock className='h-4 w-4' />
              Durée totale : {durationLabel}
            </p>

            <div className='flex items-center gap-3'>
              <Button type='button' variant='outline' className='rounded-xl' onClick={onClose}>
                Annuler
              </Button>

              <Button
                type='button'
                className='rounded-xl bg-sky-500 hover:bg-sky-400'
                disabled={!canSubmit || isCreating}
                onClick={handleSubmit}
              >
                Créer la leçon
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
