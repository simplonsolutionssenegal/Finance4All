'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useUpdateInstitution } from '@/hooks/institution/useUpdateInstitution';
import type { Institution } from '@/types/Institution';

import { InstitutionFormFields } from './shared/InstitutionFormFields';
import { institutionSchema, type InstitutionFormData } from './shared/InstitutionFormSchema';

interface EditInstitutionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refresh: () => void;
  institution: Institution;
}

export const removeZone = (zones: string[] | undefined, zoneToRemove: string): string[] => {
  return zones?.filter(z => z !== zoneToRemove) || [];
};

const EditInstitutionModal = ({
  open,
  onOpenChange,
  refresh,
  institution,
}: EditInstitutionModalProps) => {
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
    }
  }, [institution, form]);

  const { isUpdating, updateInstitution } = useUpdateInstitution({
    onSuccess: () => {
      form.reset({
        name: institution.name,
        description: institution.description,
        website: institution.website || '',
        geographicZones: institution.geographicZones || [],
        logoUrl: institution.logoUrl || '',
        type: institution.type,
        pays: institution.pays,
      });
      // Keep react-hook-form's internal value in sync.
      form.setValue('name', institution.name);

      // Update the native input element (if present) to keep uncontrolled inputs in sync.
      const nameInput = document.querySelector<HTMLInputElement>(
        'input[placeholder="Ex: Orange Money"]'
      );
      if (nameInput) {
        try {
          nameInput.value = institution.name;
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (err) {
          console.error('Failed to update name input value:', err);
        }
      }
      onOpenChange(false);
      refresh();
    },
  });

  const onSubmit = (data: InstitutionFormData) => {
    updateInstitution({ id: institution.id, data });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!isUpdating) {
          onOpenChange(o);
          if (!o)
            form.reset({
              name: institution.name,
              description: institution.description,
              website: institution.website || '',
              geographicZones: institution.geographicZones || [],
              logoUrl: institution.logoUrl || '',
              type: institution.type,
              pays: institution.pays,
            });
        }
      }}
    >
      <DialogContent
        className={
          'w-[95vw] sm:w-[512px] p-0 bg-white rounded-xl shadow-xl border border-gray-200 h-[620.4px] sm:h-[620.4px] overflow-hidden flex flex-col'
        }
      >
        <DialogHeader className='items-start p-4 pb-2'>
          <div className='flex items-center gap-3 mb-1'>
            <DialogTitle className='text-xl font-semibold text-tertiary-400'>
              Modifier l&apos;institution
            </DialogTitle>
          </div>
          <p className='text-sm text-tertiary-400/60'>
            Modifiez les informations de l&apos;institution financière
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 overflow-y-auto px-4 space-y-3'
          >
            <InstitutionFormFields
              control={form.control}
              watch={form.watch}
              errors={form.formState.errors}
              disabled={isUpdating}
              variant='compact'
            />
          </form>
        </Form>

        <div className='py-3 px-4 border-t border-gray-200 bg-white rounded-b-xl'>
          <Button
            type='submit'
            form={undefined}
            onClick={() => form.handleSubmit(onSubmit)()}
            disabled={isUpdating || !form.formState.isValid}
            className='w-full h-10 rounded-[10px] bg-primary-300 text-white hover:bg-primary-400 pl-3 gap-2 justify-start text-sm'
          >
            {isUpdating ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditInstitutionModal;
