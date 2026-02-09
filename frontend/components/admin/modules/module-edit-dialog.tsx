// frontend/src/components/modules/module-edit-dialog.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, Trash2, X } from 'lucide-react';
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
  const previousImageIdRef = useRef<string | null>(module.imageMediaId ?? null);

  const { url: existingImageUrl } = useMediaUrl(module?.imageMediaId ?? null);

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

  useEffect(() => {
    if (open) {
      // garder la valeur actuelle à l’ouverture
      previousImageIdRef.current = module.imageMediaId ?? null;

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
    }
  }, [open, module, reset]);

  // delete media (MinIO + DB)
  const { deleteMediaAsync, isDeleting } = useDeleteMedia();

  const { updateModule, isUpdating } = useUpdateModule({
    onSuccess: async () => {
      // on supprime réellement le fichier (MinIO) + l’enregistrement (DB)
      try {
        const oldId = previousImageIdRef.current;

        if (removeImage && oldId) {
          await deleteMediaAsync({ mediaId: oldId });
          previousImageIdRef.current = null;
        }
        if (!removeImage && imageFile && oldId) {
          await deleteMediaAsync({ mediaId: oldId });
          previousImageIdRef.current = null;
        }
      } catch {
        // On n’empêche pas la fermeture si la suppression média échoue
      }

      onOpenChange(false);
      onUpdated?.();
    },
  });

  const isBusy = isUpdating || isDeleting;

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

  const onSubmit: SubmitHandler<UpdateModuleFormData> = async data => {
    let imageMediaId: string | null | undefined = undefined;

    if (removeImage) {
      // ✅ on détache l’image du module
      imageMediaId = null;
    } else if (imageFile) {
      // ✅ upload nouvelle image => on attache au module
      const uploaded = await uploadModuleImage(imageFile);
      imageMediaId = uploaded.id;
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

  const title = watch('title');

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-2'>
      <button
        type='button'
        className='absolute inset-0 bg-black/40 cursor-default'
        onClick={handleClose}
        aria-label='Fermer'
        disabled={isBusy}
      />

      <div className='relative w-full max-w-[560px] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl'>
        <div className='px-5 pt-4 pb-3'>
          <button
            onClick={handleClose}
            disabled={isBusy}
            className='absolute top-3 right-3 p-2 rounded-full hover:bg-slate-100 disabled:opacity-50'
            aria-label='Fermer'
          >
            <X className='h-5 w-5 text-slate-500' />
          </button>

          <h2 className='text-lg font-semibold text-slate-900'>Modifier le module</h2>
          <p className='mt-0.5 text-sm text-slate-500'>
            Modifiez les informations du module d&apos;apprentissage
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='px-5 pb-4 space-y-3'>
          <div>
            <label className='block text-xs font-medium text-slate-900 mb-1.5'>
              Titre <span className='text-red-500'>*</span>
            </label>
            <input
              {...register('title')}
              disabled={isBusy}
              className='w-full rounded-lg bg-slate-50 px-2 py-1 text-sm text-slate-900 disabled:text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400'
            />
            {errors.title && <p className='mt-1 text-xs text-red-600'>{errors.title.message}</p>}
          </div>

          <div>
            <label className='block text-xs font-medium text-slate-900 mb-1.5'>
              Description <span className='text-red-500'>*</span>
            </label>
            <textarea
              {...register('description')}
              disabled={isBusy}
              rows={2}
              className='w-full rounded-lg bg-slate-50 px-2 py-1 text-sm text-slate-900 disabled:text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400 resize-none'
            />
            {errors.description && (
              <p className='mt-1 text-xs text-red-600'>{errors.description.message}</p>
            )}
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-medium text-slate-900 mb-1.5'>Catégorie</label>
              <input
                {...register('thematics')}
                disabled={isBusy}
                className='w-full rounded-lg bg-slate-50 px-2 py-1 text-sm text-slate-900 disabled:text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400'
              />
              {errors.thematics && (
                <p className='mt-1 text-xs text-red-600'>{errors.thematics.message}</p>
              )}
            </div>

            <div>
              <label className='block text-xs font-medium text-slate-900 mb-1.5'>Difficulté</label>
              <div className='relative'>
                <select
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

          <div className='space-y-2'>
            <label className='block text-xs font-medium text-slate-900'>Image du module</label>

            <input
              type='file'
              accept='image/png,image/jpeg,image/gif'
              disabled={isBusy}
              className='block w-full text-xs text-slate-700
                file:mr-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-2 file:py-1.5 file:text-xs file:font-medium file:text-slate-700
                hover:file:bg-slate-200'
              onChange={e => handlePickFile(e.target.files?.[0])}
            />

            <p className='text-[11px] text-slate-400'>{imageHelp}</p>

            {!removeImage && (previewUrl || existingImageUrl) ? (
              <div className='relative overflow-hidden rounded-lg bg-slate-100 border border-slate-200'>
                <div className='relative h-[120px] w-full'>
                  <Image
                    src={previewUrl || existingImageUrl || ''}
                    alt={title || 'Module image'}
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
                  className='absolute right-3 top-3 h-9 w-9 rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center disabled:opacity-50'
                  aria-label='Supprimer l’image'
                  title='Supprimer l’image'
                >
                  <Trash2 className='h-5 w-5' />
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <label className='block text-xs font-medium text-slate-900 mb-1.5'>
              Durée (minutes)
            </label>
            <input
              type='number'
              {...register('estimatedDuration', { valueAsNumber: true })}
              disabled={isBusy}
              className='w-full rounded-lg bg-slate-50 px-2 py-1 text-sm text-slate-900 disabled:text-slate-900 outline-none focus:ring-2 focus:ring-sky-400'
            />
            {errors.estimatedDuration && (
              <p className='mt-1 text-xs text-red-600'>{errors.estimatedDuration.message}</p>
            )}
          </div>

          <div className='pt-2 flex items-center justify-end gap-3'>
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
