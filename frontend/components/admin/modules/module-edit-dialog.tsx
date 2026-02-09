// frontend/src/components/admin/modules/module-edit-dialog.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { X, Trash2, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';

import { useDeleteMedia } from '@/hooks/media/useDeleteMedia';
import { useMediaUrl } from '@/hooks/module/media/useMedia';
import { useUpdateModule } from '@/hooks/module/useUpdateModule';
import { DIFFICULTY_LABELS } from '@/lib/constants/module-constants';
import { updateModuleSchema, type UpdateModuleFormData } from '@/lib/validations/module-schema';
import type { Module, UpdateModuleData } from '@/types/modules/module';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  module: Module;
  onUpdated?: () => void;
};

export default function ModuleEditDialog({ open, onOpenChange, module, onUpdated }: Props) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  // image existante (preview depuis ton endpoint media)
  const { url: existingImageUrl } = useMediaUrl(module?.imageMediaId ?? null);

  // ✅ on mémorise l’ancienne image pour pouvoir la supprimer après update
  const previousImageIdRef = useRef<string | null>(module.imageMediaId ?? null);

  // ✅ si on doit supprimer un media après update
  const mediaToDeleteAfterUpdateRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UpdateModuleFormData>({
    resolver: zodResolver(updateModuleSchema),
    defaultValues: {
      title: module.title,
      description: module.description,
      thematics: module.thematics,
      difficultyLevel: module.difficultyLevel,
      estimatedDuration: Number(module.estimatedDuration ?? 0),
      status: module.status,
    },
  });

  // Reset à l’ouverture / changement module
  useEffect(() => {
    if (open) {
      reset({
        title: module.title,
        description: module.description,
        thematics: module.thematics,
        difficultyLevel: module.difficultyLevel,
        estimatedDuration: Number(module.estimatedDuration ?? 0),
        status: module.status,
      });

      setImageFile(null);
      setRemoveImage(false);

      previousImageIdRef.current = module.imageMediaId ?? null;
      mediaToDeleteAfterUpdateRef.current = null;
    }
  }, [open, module, reset]);

  const { deleteMediaAsync } = useDeleteMedia();

  const { updateModule, isUpdating } = useUpdateModule({
    onSuccess: () => {
      // ✅ IMPORTANT: onSuccess ne doit pas être async (Sonar)
      const mediaId = mediaToDeleteAfterUpdateRef.current;

      // Ferme + refresh UI
      onOpenChange(false);
      onUpdated?.();

      // Supprime réellement l’ancienne image (MinIO + DB) après la mise à jour du module
      if (mediaId) {
        void deleteMediaAsync({ mediaId }).finally(() => {
          mediaToDeleteAfterUpdateRef.current = null;
        });
      }
    },
  });

  const isBusy = isUpdating;

  const imageHelp = useMemo(() => 'Formats acceptés: JPG, PNG, GIF (max 5MB)', []);

  async function uploadModuleImage(file: File) {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/media`, {
      method: 'POST',
      body: form,
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) throw new Error(json?.message ?? 'Upload image échoué');
    return json?.data ?? json; // { id, ... }
  }

  const handlePickFile = (file?: File) => {
    if (!file) return;
    setRemoveImage(false);
    setImageFile(file);
  };

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onSubmit: SubmitHandler<UpdateModuleFormData> = async data => {
    let imageMediaId: string | null | undefined = undefined;

    const oldId = previousImageIdRef.current;

    // Si l’utilisateur supprime l’image
    if (removeImage) {
      imageMediaId = null;

      // ✅ on supprime l’ancienne image après update
      if (oldId) mediaToDeleteAfterUpdateRef.current = oldId;
    }
    // Si l’utilisateur remplace l’image
    else if (imageFile) {
      const uploaded = await uploadModuleImage(imageFile);
      imageMediaId = uploaded.id;

      // ✅ on supprime l’ancienne image après update (si elle existe)
      if (oldId && oldId !== uploaded.id) {
        mediaToDeleteAfterUpdateRef.current = oldId;
      }
    }

    const payload: UpdateModuleData = {
      ...data,
      estimatedDuration: data.estimatedDuration ?? undefined,
      ...(imageMediaId !== undefined ? { imageMediaId } : {}),
    };

    updateModule({ id: module.id, data: payload });
  };

  const handleClose = () => {
    if (!isBusy) onOpenChange(false);
  };

  const titleValue = watch('title') || module.title;

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-2'>
      {/* Backdrop */}
      <button
        type='button'
        className='absolute inset-0 bg-black/40 cursor-default'
        onClick={handleClose}
        aria-label='Fermer'
        disabled={isBusy}
      />

      {/* Modal (compact) */}
      <div className='relative w-full max-w-[560px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl'>
        {/* Header (compact) */}
        <div className='px-5 pt-4 pb-3'>
          <button
            onClick={handleClose}
            disabled={isBusy}
            className='absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100 disabled:opacity-50'
            aria-label='Fermer'
            title='Fermer'
          >
            <X className='h-5 w-5 text-slate-500' />
          </button>

          <h2 className='text-lg font-semibold text-slate-900'>Modifier le module</h2>
          <p className='mt-0.5 text-sm text-slate-500'>
            Modifiez les informations du module d&apos;apprentissage
          </p>
        </div>

        {/* Form (encore plus compact) */}
        <form onSubmit={handleSubmit(onSubmit)} className='px-5 pb-4 space-y-2'>
          {/* Titre */}
          <div>
            <label htmlFor='module-title' className='block text-xs font-medium text-slate-900 mb-1'>
              Titre <span className='text-red-500'>*</span>
            </label>
            <input
              id='module-title'
              {...register('title')}
              disabled={isBusy}
              className='w-full rounded-lg bg-slate-50 px-2 py-1 text-sm text-slate-900 disabled:text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400'
            />
            {errors.title && <p className='mt-1 text-xs text-red-600'>{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor='module-description'
              className='block text-xs font-medium text-slate-900 mb-1'
            >
              Description <span className='text-red-500'>*</span>
            </label>
            <textarea
              id='module-description'
              {...register('description')}
              disabled={isBusy}
              rows={2}
              className='w-full rounded-lg bg-slate-50 px-2 py-1 text-sm text-slate-900 disabled:text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400 resize-none'
            />
            {errors.description && (
              <p className='mt-1 text-xs text-red-600'>{errors.description.message}</p>
            )}
          </div>

          {/* Catégorie + Difficulté */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
            <div>
              <label
                htmlFor='module-thematics'
                className='block text-xs font-medium text-slate-900 mb-1'
              >
                Catégorie
              </label>
              <input
                id='module-thematics'
                {...register('thematics')}
                disabled={isBusy}
                className='w-full rounded-lg bg-slate-50 px-2 py-1 text-sm text-slate-900 disabled:text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400'
              />
              {errors.thematics && (
                <p className='mt-1 text-xs text-red-600'>{errors.thematics.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor='module-difficulty'
                className='block text-xs font-medium text-slate-900 mb-1'
              >
                Difficulté
              </label>
              <div className='relative'>
                <select
                  id='module-difficulty'
                  {...register('difficultyLevel')}
                  disabled={isBusy}
                  className='w-full appearance-none rounded-lg bg-slate-50 px-2 py-1 pr-9 text-sm text-slate-900 disabled:text-slate-900 outline-none focus:ring-2 focus:ring-sky-400'
                >
                  {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500' />
              </div>
              {errors.difficultyLevel && (
                <p className='mt-1 text-xs text-red-600'>{errors.difficultyLevel.message}</p>
              )}
            </div>
          </div>

          {/* Image */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between'>
              <label htmlFor='module-image' className='block text-xs font-medium text-slate-900'>
                Image du module
              </label>
            </div>

            <input
              id='module-image'
              type='file'
              accept='image/png,image/jpeg,image/gif'
              disabled={isBusy}
              className='block w-full text-xs text-slate-700
                file:mr-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs file:font-medium file:text-slate-700
                hover:file:bg-slate-200'
              onChange={e => handlePickFile(e.target.files?.[0])}
            />

            <p className='text-[11px] text-slate-400'>{imageHelp}</p>

            {!removeImage && (previewUrl || existingImageUrl) ? (
              <div className='relative overflow-hidden rounded-xl bg-slate-100 border border-slate-200'>
                <div className='relative h-[96px] w-full'>
                  <Image
                    src={previewUrl || existingImageUrl || ''}
                    alt={titleValue}
                    fill
                    className='object-cover'
                    sizes='560px'
                  />
                </div>

                <button
                  type='button'
                  disabled={isBusy}
                  onClick={() => {
                    setImageFile(null);
                    setRemoveImage(true);
                  }}
                  className='absolute right-3 top-3 h-8 w-8 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center disabled:opacity-50'
                  aria-label="Supprimer l'image"
                  title="Supprimer l'image"
                >
                  <Trash2 className='h-4 w-4' />
                </button>
              </div>
            ) : null}
          </div>

          {/* Durée */}
          <div>
            <label
              htmlFor='module-duration'
              className='block text-xs font-medium text-slate-900 mb-1'
            >
              Durée (minutes)
            </label>
            <input
              id='module-duration'
              type='number'
              {...register('estimatedDuration', { valueAsNumber: true })}
              disabled={isBusy}
              className='w-full rounded-lg bg-slate-50 px-2 py-1 text-sm text-slate-900 disabled:text-slate-900 outline-none focus:ring-2 focus:ring-sky-400'
            />
            {errors.estimatedDuration && (
              <p className='mt-1 text-xs text-red-600'>{errors.estimatedDuration.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className='pt-1 flex items-center justify-end gap-3'>
            <button
              type='button'
              onClick={handleClose}
              disabled={isBusy}
              className='px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50'
            >
              Annuler
            </button>

            <button
              type='submit'
              disabled={isBusy}
              className='px-4 py-2 text-sm rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium disabled:opacity-50'
            >
              {isBusy ? 'Mise à jour...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
