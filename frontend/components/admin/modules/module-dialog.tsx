// frontend/src/components/modules/module-dialog.tsx

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { useCreateModule } from '@/hooks/module/useCreateModule';
import { DIFFICULTY_LABELS, THEMATIC_LABELS } from '@/lib/constants/module-constants';
import { createModuleSchema } from '@/lib/validations/module-schema';
// eslint-disable-next-line no-duplicate-imports
import type { CreateModuleFormData } from '@/lib/validations/module-schema';
import { DifficultyLevel, Thematic, type CreateModuleData } from '@/types/modules/module';

interface ModuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModuleDialog({ isOpen, onClose }: ModuleDialogProps) {
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
      imageUrl: '',
      difficultyLevel: DifficultyLevel.BEGINNER,
      estimatedDuration: 60,
      thematics: [Thematic.FINANCIAL_EDUCATION],
    },
  });

  const { createModule, isCreating } = useCreateModule({
    onSuccess: () => {
      reset();
      onClose();
    },
  });

  // Réinitialiser le formulaire quand le dialog se ferme
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit: SubmitHandler<CreateModuleFormData> = async data => {
    const payload: CreateModuleData = {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || null,
      difficultyLevel: data.difficultyLevel,
      estimatedDuration: data.estimatedDuration,
      thematics: data.thematics,
    };

    createModule(payload);
  };

  const handleClose = () => {
    if (!isCreating) {
      reset();
      onClose();
    }
  };

  // Gestionnaire pour le clavier (Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isCreating) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop - Accessible */}
      <div
        className='absolute inset-0 bg-black/50'
        onClick={handleClose}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClose();
          }
        }}
        role='button'
        tabIndex={0}
        aria-label='Fermer le dialog'
      />

      {/* Modal - Hauteur réduite */}
      <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-lg'>
        {/* Header - Plus compact */}
        <div className='relative px-8 pt-6 pb-3'>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className='absolute top-4 right-6 p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50'
            aria-label='Fermer'
          >
            <X size={24} className='text-gray-400' />
          </button>

          <h2 className='text-2xl font-bold text-gray-900 mb-1'>Nouveau module</h2>
          <p className='text-sm text-gray-500'>
            Créez un nouveau module apprentissage. Vous pourrez ensuite ajouter des leçons et des
            quiz.
          </p>
        </div>

        {/* Form - Espacement réduit */}
        <form onSubmit={handleSubmit(onSubmit)} className='px-8 pb-6 space-y-4'>
          {/* Titre */}
          <div>
            <label htmlFor='title' className='block text-sm font-medium text-gray-900 mb-1.5'>
              Titre <span className='text-red-500'>*</span>
            </label>
            <input
              id='title'
              {...register('title')}
              className='w-full px-4 py-2.5 text-sm bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors'
              placeholder='Ex: Introduction à la finance'
              disabled={isCreating}
            />
            {errors.title && <p className='mt-1 text-xs text-red-600'>{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor='description' className='block text-sm font-medium text-gray-900 mb-1.5'>
              Description <span className='text-red-500'>*</span>
            </label>
            <textarea
              id='description'
              {...register('description')}
              rows={2}
              className='w-full px-4 py-2.5 text-sm bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none'
              placeholder='Description du module'
              disabled={isCreating}
            />
            {errors.description && (
              <p className='mt-1 text-xs text-red-600'>{errors.description.message}</p>
            )}
          </div>

          {/* Thématique et Difficulté */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label htmlFor='thematic' className='block text-sm font-medium text-gray-900 mb-1.5'>
                Thématique
              </label>
              <select
                id='thematic'
                {...register('thematics.0')}
                className='w-full px-4 py-2.5 text-sm bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer'
                disabled={isCreating}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                {Object.entries(THEMATIC_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor='difficultyLevel'
                className='block text-sm font-medium text-gray-900 mb-1.5'
              >
                Difficulté
              </label>
              <select
                id='difficultyLevel'
                {...register('difficultyLevel')}
                className='w-full px-4 py-2.5 text-sm bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer'
                disabled={isCreating}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* URL de l'image */}
          <div>
            <label htmlFor='imageUrl' className='block text-sm font-medium text-gray-900 mb-1.5'>
              Image du module
            </label>
            <input
              id='imageUrl'
              type='url'
              {...register('imageUrl')}
              className='w-full px-4 py-2.5 text-sm bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors'
              placeholder=' Formats acceptés: JPG, PNG, GIF (max 5MB)'
              disabled={isCreating}
            />
            {errors.imageUrl && (
              <p className='mt-1 text-xs text-red-600'>{errors.imageUrl.message}</p>
            )}
          </div>

          {/* Durée estimée */}
          <div>
            <label
              htmlFor='estimatedDuration'
              className='block text-sm font-medium text-gray-900 mb-1.5'
            >
              Durée estimée (minutes)
            </label>
            <input
              id='estimatedDuration'
              type='number'
              {...register('estimatedDuration', { valueAsNumber: true })}
              className='w-full px-4 py-2.5 text-sm bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors'
              placeholder='0'
              disabled={isCreating}
            />
            {errors.estimatedDuration && (
              <p className='mt-1 text-xs text-red-600'>{errors.estimatedDuration.message}</p>
            )}
          </div>

          {/* Boutons d'action */}
          <div className='flex gap-3 pt-3'>
            <button
              type='button'
              onClick={handleClose}
              className='flex-1 px-6 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors'
              disabled={isCreating}
            >
              Annuler
            </button>
            <button
              type='submit'
              disabled={isCreating}
              className='flex-1 px-6 py-2.5 text-sm bg-sky-400 text-white rounded-lg font-medium hover:bg-sky-500 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors'
            >
              {isCreating ? (
                <>
                  <svg
                    className='animate-spin h-4 w-4'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    />
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    />
                  </svg>
                  Création...
                </>
              ) : (
                'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
