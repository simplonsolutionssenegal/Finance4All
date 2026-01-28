// frontend/src/components/modules/module-dialog.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { useCreateModule } from '@/hooks/module/useCreateModule';
import { DIFFICULTY_LABELS } from '@/lib/constants/module-constants';
import { createModuleSchema, type CreateModuleFormData } from '@/lib/validations/module-schema';
import { DifficultyLevel, type CreateModuleData } from '@/types/modules/module';

interface ModuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModuleDialog({ isOpen, onClose }: ModuleDialogProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateModuleFormData>({
    resolver: zodResolver(createModuleSchema),
    defaultValues: {
      title: '',
      description: '',
      thematics: '',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 0,
    },
  });

  const { createModule, isCreating } = useCreateModule({
    onSuccess: () => {
      reset();
      setImageFile(null);
      onClose();
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      setImageFile(null);
    }
  }, [isOpen, reset]);

  const imageHelp = useMemo(() => 'JPG, PNG, GIF (max 5MB)', []);

  const onSubmit: SubmitHandler<CreateModuleFormData> = async data => {
    const payload: CreateModuleData = {
      title: data.title,
      description: data.description,
      difficultyLevel: data.difficultyLevel,
      estimatedDuration: data.estimatedDuration ?? 0,
      thematics: data.thematics,
      imageUrl: null,
    };

    createModule(payload);
  };

  const handleClose = () => {
    if (!isCreating) {
      reset();
      setImageFile(null);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isCreating) handleClose();
  };

  const handlePickFile = (file?: File) => {
    if (!file) return;
    setImageFile(file);
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-2'
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/50'
        onClick={handleClose}
        role='button'
        tabIndex={0}
        aria-label='Fermer le dialog'
      />

      {/* Modal (plus petit) */}
      <div
        className='relative w-full max-w-lg bg-white
          h-auto 
          rounded-[12px]
          border border-[#DEE2E6]
          overflow-hidden
          shadow-[0_4px_6px_-4px_rgba(0,0,0,0.10),0_10px_15px_-3px_rgba(0,0,0,0.10)]
        '
      >
        {/* Header (compact) */}
        <div className='relative px-3 pt-3 pb-3'>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className='absolute top-3 right-5 p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50'
            aria-label='Fermer'
          >
            <X size={20} className='text-gray-400' />
          </button>

          <h2 className='text-xl font-bold text-gray-900 mb-1'>Nouveau module</h2>
          <p className='text-sm text-gray-500'>
            Créez un nouveau module de apprentissage. Vous pourrez ensuite ajouter des leçons et des
            quiz.
          </p>
        </div>

        {/* Form (compact) */}
        <form onSubmit={handleSubmit(onSubmit)} className='px-3 pb-2 space-y-1.5'>
          {/* Titre */}
          <div>
            <label htmlFor='title' className='block text-xs font-medium text-gray-900 mb-1'>
              Titre <span className='text-red-500'>*</span>
            </label>
            <input
              id='title'
              {...register('title')}
              disabled={isCreating}
              placeholder='Ex: Introduction à la finance personnelle'
              className='w-full px-2 py-1.5 text-sm bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors'
            />
            {errors.title && <p className='mt-1 text-xs text-red-600'>{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor='description' className='block text-xs font-medium text-gray-900 mb-1'>
              Description <span className='text-red-500'>*</span>
            </label>
            <textarea
              id='description'
              {...register('description')}
              disabled={isCreating}
              rows={2}
              placeholder='Description détaillée du module'
              className='w-full px-3 py-1.5 text-sm bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none'
            />
            {errors.description && (
              <p className='mt-1 text-xs text-red-600'>{errors.description.message}</p>
            )}
          </div>

          {/* thematics + Difficulté */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label htmlFor='thematics' className='block text-xs font-medium text-gray-900 mb-1'>
                Thématiques
              </label>
              <input
                id='thematics'
                {...register('thematics')}
                disabled={isCreating}
                placeholder='Ex: Finance de base'
                className='w-full px-2 py-1.5 text-sm bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors'
              />
              {errors.thematics && (
                <p className='mt-1 text-xs text-red-600'>{errors.thematics.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='difficultyLevel'
                className='block text-xs font-medium text-gray-900 mb-1'
              >
                Difficulté
              </label>
              <select
                id='difficultyLevel'
                {...register('difficultyLevel')}
                disabled={isCreating}
                className='w-full px-2 py-1.5 text-sm bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer'
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.65rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.4em 1.4em',
                  paddingRight: '2rem',
                }}
              >
                {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.difficultyLevel && (
                <p className='mt-1 text-xs text-red-600'>{errors.difficultyLevel.message}</p>
              )}
            </div>
          </div>

          {/* Durée */}
          <div>
            <label
              htmlFor='estimatedDuration'
              className='block text-xs font-medium text-gray-900 mb-1'
            >
              Durée estimée (minutes)
            </label>
            <input
              id='estimatedDuration'
              type='number'
              {...register('estimatedDuration', { valueAsNumber: true })}
              disabled={isCreating}
              placeholder='0'
              className='w-full px-2 py-1.5 text-sm bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors'
            />
            {errors.estimatedDuration && (
              <p className='mt-1 text-xs text-red-600'>{errors.estimatedDuration.message}</p>
            )}
          </div>

          {/* Upload image (compact) */}
          <div>
            <label className='block text-xs font-medium text-gray-900 mb-1.5'>
              Image du module
            </label>

            <label className='flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-gray-200 bg-white px-1 py-2 cursor-pointer hover:bg-gray-50 transition-colors'>
              <input
                type='file'
                accept='image/png,image/jpeg,image/gif'
                className='hidden'
                disabled={isCreating}
                onChange={e => handlePickFile(e.target.files?.[0])}
              />

              <div className='h-7 w-7 rounded-xl bg-gray-100 flex items-center justify-center'>
                <Upload className='text-gray-500' size={20} />
              </div>

              <p className='text-sm text-gray-600'>
                {imageFile ? (
                  <span className='font-medium text-gray-900'>{imageFile.name}</span>
                ) : (
                  'Cliquez pour télécharger une image'
                )}
              </p>
              <p className='text-xs text-gray-400'>{imageHelp}</p>
            </label>
          </div>

          {/* Actions */}
          <div className='flex items-center justify-end gap-3 pt-2'>
            <button
              type='button'
              onClick={handleClose}
              disabled={isCreating}
              className='px-5 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50'
            >
              Annuler
            </button>

            <button
              type='submit'
              disabled={isCreating}
              className='px-5 py-2.5 text-sm bg-primary-300 text-white rounded-xl font-medium hover:bg-primary-400 disabled:bg-primary-400 transition-colors'
            >
              {isCreating ? 'Création...' : 'Créer le module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
