'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useCreateInstitution } from '@/hooks/institution/useCreateInstitution';
import { useUpdateInstitution } from '@/hooks/institution/useUpdateInstitution';
import type { Institution } from '@/types/Institution';

import { InstitutionFormFields } from './shared/InstitutionFormFields';
import { institutionSchema, type InstitutionFormData } from './shared/InstitutionFormSchema';

interface InstitutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refresh: () => void;
  institution?: Institution | null;
}

const InstitutionModal = ({ open, onOpenChange, refresh, institution }: InstitutionModalProps) => {
  const isEditMode = !!institution;

  const form = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: '',
      description: '',
      website: '',
      geographicZones: [],
      logoUrl: '',
      type: undefined,
      pays: undefined,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (institution) {
      form.reset({
        name: institution.name,
        description: institution.description,
        website: institution.website || '',
        geographicZones: institution.geographicZones,
        logoUrl: institution.logoUrl || '',
        type: institution.type,
        pays: institution.pays,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        website: '',
        geographicZones: [],
        logoUrl: '',
        type: undefined,
        pays: undefined,
      });
    }
  }, [institution, form]);

  const { isCreating, createInstitution } = useCreateInstitution({
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
      refresh();
    },
  });

  const { isUpdating, updateInstitution } = useUpdateInstitution({
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
      refresh();
    },
  });

  const onSubmit = (data: InstitutionFormData) => {
    if (isEditMode && institution) {
      updateInstitution({ id: institution.id, data });
    } else {
      createInstitution(data);
    }
  };

  const isSubmitting = isCreating || isUpdating;

  let submitLabel = 'Enregistrer les modifications';
  if (isSubmitting) submitLabel = 'Enregistrement…';
  else if (!isEditMode) submitLabel = 'Créer l&apos;institution';

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!isSubmitting) {
          onOpenChange(o);
          if (!o) form.reset();
        }
      }}
    >
      <DialogContent
        className='
          w-[95vw] sm:w-[512px]
          p-0 bg-white
          rounded-xl shadow-xl border border-gray-200
          h-[600px] overflow-y-auto
        '
      >
        <DialogHeader className='items-start p-6 pb-4 border-b border-gray-100'>
          <DialogTitle className='text-xl font-semibold text-tertiary-400'>
            {isEditMode ? 'Modifier l&apos;institution' : 'Nouvelle institution'}
          </DialogTitle>
          <p className='text-sm text-tertiary-400/60'>
            {isEditMode
              ? 'Modifiez les informations de l&apos;institution financière'
              : 'Créez une nouvelle institution financière sur la plateforme. Elle sera en attente de validation avant d&apos;être active.'}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='p-6 pt-5 space-y-4'>
            <div className='space-y-4'>
              <InstitutionFormFields
                control={form.control}
                watch={form.watch}
                errors={form.formState.errors}
                disabled={isSubmitting}
                variant='default'
              />
            </div>

            <DialogFooter className='sticky -mx-6 -mb-6 mt-6 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl'>
              <div className='flex w-full justify-end gap-3'>
                <Button
                  type='button'
                  variant='ghost'
                  className='h-11 px-6 rounded-md hover:bg-gray-200'
                  onClick={() => !isSubmitting && onOpenChange(false)}
                >
                  Annuler
                </Button>
                <Button
                  type='submit'
                  disabled={isSubmitting || !form.formState.isValid}
                  className='h-11 px-6 rounded-md bg-cyan-500 text-white hover:bg-cyan-600'
                >
                  {submitLabel}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InstitutionModal;
